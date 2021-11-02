import logging
import os

import tensorflow as tf
import dllogger

from mrcnn_tf2.model.mask_rcnn import MaskRCNN
from mrcnn_tf2.runtime.callbacks import DLLoggerMetricsCallback, DLLoggerPerfCallback, PretrainedWeightsLoadingCallback
from mrcnn_tf2.runtime.evaluation import evaluate
from mrcnn_tf2.runtime.learning_rate import PiecewiseConstantWithWarmupSchedule
from mrcnn_tf2.runtime.weights_mapping import WEIGHTS_MAPPING


async def run_training(dataset, train_batch_size,init_learning_rate,
                       learning_rate_boundaries,learning_rate_values,momentum,
                       epochs,steps_per_epoch,xla,amp,model_dir,model_params,callback_params):
    setup(xla,amp)
    
    #strategy = tf.distribute.MirroredStrategy()
    #params.replicas = strategy.num_replicas_in_sync
    #params.global_train_batch_size = params.train_batch_size #* params.replicas
    #logging.info(f'Distributed Strategy is activated for {params.replicas} device(s)')

    #with strategy.scope():

    learning_rate = PiecewiseConstantWithWarmupSchedule(
        init_value=init_learning_rate,
        # scale boundaries from epochs to steps
        boundaries=[
            #int(b * dataset.train_size / params.global_train_batch_size)
            int(b * dataset.train_size / train_batch_size)
            for b in learning_rate_boundaries
        ],
        values=learning_rate_values,
        # scale only by local BS as distributed strategy later scales it by number of replicas
        scale=train_batch_size
    )

    optimizer = tf.keras.optimizers.SGD(
        learning_rate=learning_rate,
        momentum=momentum
    )

    mask_rcnn_model = create_model(True,model_dir,model_params)

    mask_rcnn_model.compile(
        optimizer=optimizer
    )

    # distributed strategy splits data between instances so we need global BS
    train_data = dataset.train_fn(batch_size=train_batch_size)

    #if params.eagerly:
    #    mask_rcnn_model.run_eagerly = True
    #    logging.warning('Model is running in eager mode which might reduce performance')

    mask_rcnn_model.fit(
        x=train_data,
        epochs=epochs,
        steps_per_epoch=steps_per_epoch or (dataset.train_size //train_batch_size),
        callbacks=list(create_callbacks(train_batch_size,eval_batch_size, model_dir,callback_params)),
        verbose=0
    )


def run_evaluation(dataset,train_batch_size, eval_batch_size,eval_file,include_mask,xla,amp,model_dir,model_params,callback_params):
    setup(xla,amp)

    mask_rcnn_model = create_model(False,model_dir,model_params)

    #if params.eagerly:
    #    mask_rcnn_model.run_eagerly = True
    #    logging.warning('Model is running in eager mode which might reduce performance')

    predictions = mask_rcnn_model.predict(
        x=dataset.eval_fn(eval_batch_size),
        callbacks=list(create_callbacks(train_batch_size,eval_batch_size,callback_params))
    )

    eval_results = evaluate(
        predictions=predictions,
        eval_file= eval_file,
        include_mask= include_mask
    )

    dllogger.log(
        step=tuple(),
        data={k: float(v) for k, v in eval_results.items()}
    )


def run_inference(dataset,train_batch_size,eval_batch_size,xla,amp,model_dir, model_params,callback_params):
    setup(xla,amp)

    mask_rcnn_model = create_model(False,model_dir,model_params)

    #if params.eagerly:
    #    mask_rcnn_model.run_eagerly = True
    #    logging.warning('Model is running in eager mode which might reduce performance')

    mask_rcnn_model.predict(
        x=dataset.eval_fn(eval_batch_size),
        callbacks=list(create_callbacks(train_batch_size,eval_batch_size,callback_params))
    )


def setup(xla,amp):

    # enforces that AMP is enabled using --amp and not env var
    # mainly for NGC where it is enabled by default
    os.environ['TF_ENABLE_AUTO_MIXED_PRECISION'] = '0'

    if xla:
        tf.config.optimizer.set_jit(True)
        logging.info('XLA is activated')

    if amp:
        policy = tf.keras.mixed_precision.experimental.Policy("mixed_float16", loss_scale="dynamic")
        tf.keras.mixed_precision.experimental.set_policy(policy)
        logging.info('AMP is activated')


def create_model(trainable,model_dir,params):
    model = MaskRCNN(
        trainable=trainable,
        params=params
    )

    checkpoint_path = tf.train.latest_checkpoint(model_dir)

    # if there is no checkpoint we are done
    if checkpoint_path is None:
        logging.info(f"No checkpoint was found in: {model_dir}")
        return model

    model.load_weights(checkpoint_path).expect_partial()
    logging.info(f"Loaded weights from checkpoint: {checkpoint_path}")

    # don't load backbone weights to do not override the checkpoint
    if params.backbone_checkpoint:
        params.backbone_checkpoint = None
        logging.info("Pretrained backbone weights will not be loaded")

    return model


def create_callbacks(train_batch_size,eval_batch_size,model_dir,callback_params):
    yield DLLoggerMetricsCallback(
        dllogger=dllogger,
        log_every=100
    )

    yield DLLoggerPerfCallback(
        dllogger=dllogger,
        batch_sizes={
            'train': train_batch_size,
            'test': eval_batch_size,
            'predict': eval_batch_size
        },
        warmup_steps=100,
        log_every=100
    )
    
    yield PretrainedWeightsLoadingCallback(
        checkpoint_path='../../weights/rn50_tf_amp_ckpt_v20.06.0/nvidia_rn50_tf_amp',
        mapping=lambda name: WEIGHTS_MAPPING.get(name.replace(':0', ''), name)
    )

    yield tf.keras.callbacks.ModelCheckpoint(
        filepath=os.path.join(model_dir, callback_params.checkpoint_name_format),
        verbose=1
    )

    #if callback_params.log_tensorboard:
    #    yield tf.keras.callbacks.TensorBoard(
    #        log_dir=callback_params.log_tensorboard,
    #        update_freq='batch'
    #    )
    yield tf.keras.callbacks.TensorBoard(
        log_dir=model_dir+'/tblog',
        update_freq='batch'
    )
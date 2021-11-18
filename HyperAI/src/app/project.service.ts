import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "../../node_modules/rxjs/dist/types";

import { Project, EditMember, StructuralTask, VisionTask, TextTask } from './project.data';


@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  constructor(private http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>('/project');
  }

  getProject(name: string): Observable<Project> {
    return this.http.get<Project>('/project/' + name);
  }

  createProject(project: Project): Observable<string> {
    return this.http.post('/project', project, { responseType: 'text' });
  }

  editProjectMembers(name: string, editInfo: EditMember): Observable<string> {
    return this.http.put('/project/' + name + '/members', editInfo, { responseType: "text" });
  }

  deleteProject(name: string): Observable<string> {
    return this.http.delete('/project/' + name, { responseType: 'text' });
  }

  addTask(name: string, type: 'structural'|'text'|'vision', task: StructuralTask | VisionTask | TextTask): Observable<string> {
    return this.http.put('/project/' + name + '/task', { type: type, task: task }, { responseType: 'text' });
  }

  editTask(name: string, type: 'structural' | 'text' | 'vision', taskName: string, modification: object) {
    return this.http.put('/project/' + name + '/task/' + taskName, { type: type, modification: modification });
  }

  deleteTask(name: string, type: 'structural' | 'text' | 'vision',taskName:string): Observable<string> {
    return this.http.delete('/project/' + name + '/task/'+type+'/'+taskName, { responseType: "text" });
  }
}


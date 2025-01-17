// Types
// export type Project = {
//     id: string;
//     name: string;
//     description: string;
//     status: 'active' | 'completed' | 'on_hold';
//     teamId?: string;
//     task_statuses: string[];
//     created_at: string;
//     due_date?: string;
//     tasks?: Task[];
// };

export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on_hold';
    team?: string;
    task_statuses: string[];
    created_at: string;
    due_date?: string;
    tasks: Task[];
}

export interface BasicProject {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on_hold';
    team?: string;
    task_statuses: string[];
    created_at: string;
    due_date?: string;
}

export interface CreateProject {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on_hold';
    team?: string;
    task_statuses: string[];
    created_at: string;
    due_date?: string;
}

export type Task = {
    id: string;
    title: string;
    description: string;
    status?: string;
    priority: 'low' | 'medium' | 'high';
    due_date: string;
    created_at: string;
    project?: Project;
    assigned_to?: string;
    created_by?: string;
    tags: string[];
};

export type CreateTask = {
    id: string;
    title: string;
    description: string;
    status?: string;
    priority: 'low' | 'medium' | 'high';
    due_date: string;
    created_at: string;
    project?: string;
    assigned_to?: string;
    created_by?: string;
    tags: string[];
};

export type Comment = {
    id: string;
    taskId: string;
    content: string;
    createdAt: string;
    createdBy: string;
};

export type Team = {
    id: string;
    name: string;
    description: string;
    members: {
        userId: string;
        role: 'admin' | 'member';
    }[];
};

export interface TasksResponse {
    personal_tasks: Task[];
    project_tasks: Project[];
}

const API_URL = 'http://192.168.0.11:8000';

class ApiService {
    private static getHeaders(token: string) {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }

    static async getUserProjects(token: string): Promise<Project[]> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/projects/user_projects`, {
            method: 'GET',
            headers,
        });
        const data = await response.json();
        return data.projects;
    }

    static async getUserBasicProjects(token: string): Promise<BasicProject[]> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/projects/basic_projects`, {
            method: 'GET',
            headers,
        });
        const data = await response.json();
        return data.projects;
    }

    static async createProject(token: string, project: Omit<CreateProject, 'id' | 'created_at'>): Promise<Project> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/projects/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(project),
        });
        return await response.json();
    }

    static async createTask(token: string, task: Omit<CreateTask, 'id' | 'created_at' | 'created_by'>): Promise<Task> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/tasks/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(task),
        });
        return await response.json();
    }

    static async getAllVisibleTasks(token: string): Promise<TasksResponse> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/tasks/user_visible_tasks/`, {
            headers,
        });
        return await response.json();
    }

    static async getPersonalTasks(token: string): Promise<Task[]> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/tasks/personal_tasks/`, {
            headers,
        });
        const data = await response.json();
        return data.tasks;
    }

    static async getProjectTasks(token: string): Promise<Task[]> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/tasks/project_tasks/`, {
            headers,
        });
        const data = await response.json();
        return data.tasks;
    }

    static async getTask(token: string, taskId: string): Promise<Task> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
            headers,
        });
        return await response.json();
    }
    
    static async getProject(token: string, projectId: string): Promise<Project> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/projects/${projectId}/`, {
            headers,
        });
        return await response.json();
    }

    static async updateProject(token: string, projectId: string, updates: Partial<Project>): Promise<Project> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/projects/${projectId}/`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(updates),
        });
        return await response.json();
    }

    // updateTask
    static async updateTask(token: string, taskId: string, updates: Partial<Task>): Promise<Task> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(updates),
        });
        return await response.json();
    }

    // static async updateTask(token: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    //     const headers = this.getHeaders(token);
    //     const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
    //         method: 'PATCH',
    //         headers,
    //         body: JSON.stringify(updates),
    //     });
    //     return await response.json();
    // }

    // // Teams
    // static async getUserTeams(token: string): Promise<Team[]> {
    //     const headers = this.getHeaders(token);
    //     const response = await fetch(`${API_URL}/teams/`, {
    //         headers,
    //     });
    //     return await response.json();
    // }

    // static async createTeam(token: string, team: Omit<Team, 'id'>): Promise<Team> {
    //     const headers = this.getHeaders(token);
    //     const response = await fetch(`${API_URL}/teams/`, {
    //         method: 'POST',
    //         headers,
    //         body: JSON.stringify(team),
    //     });
    //     return await response.json();
    // }

    // // Comments
    // static async getTaskComments(token: string, taskId: string): Promise<Comment[]> {
    //     const headers = this.getHeaders(token);
    //     const response = await fetch(`${API_URL}/comments/?task=${taskId}`, {
    //         headers,
    //     });
    //     return await response.json();
    // }

    // static async createComment(token: string, comment: Omit<Comment, 'id' | 'createdAt' | 'createdBy'>): Promise<Comment> {
    //     const headers = this.getHeaders(token);
    //     const response = await fetch(`${API_URL}/comments/`, {
    //         method: 'POST',
    //         headers,
    //         body: JSON.stringify(comment),
    //     });
    //     return await response.json();
    // }

    // // Error handling helper
    // static async handleResponse(response: Response) {
    //     if (!response.ok) {
    //         const error = await response.json();
    //         throw new Error(error.message || 'An error occurred');
    //     }
    //     return response.json();
    // }
}

export default ApiService;
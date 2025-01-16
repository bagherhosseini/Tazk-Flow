// Types
export type Project = {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on_hold';
    teamId?: string;
    task_statuses: string[];
    createdAt: string;
    due_date?: string;
};

export type Task = {
    id: string;
    title: string;
    description: string;
    status?: string;
    priority: 'low' | 'medium' | 'high';
    due_date: string;
    created_at: string;
    project?: string;
    project_name?: string;
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

    static async createProject(token: string, project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
        const headers = this.getHeaders(token);
        console.log(project);
        const response = await fetch(`${API_URL}/projects/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(project),
        });
        return await response.json();
    }

    static async createTask(token: string, task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>): Promise<Task> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/tasks/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(task),
        });
        return await response.json();
    }

    static async getAllVisibleTasks(token: string): Promise<Task[]> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/tasks/user_visible_tasks/`, {
            headers,
        });
        const data = await response.json();
        return data.tasks;
    }

    static async getPersonalTasks(token: string): Promise<Task[]> {
        const headers = this.getHeaders(token);
        const response = await fetch(`${API_URL}/tasks/personal_tasks/`, {
            headers,
        });
        const data = await response.json();
        return data.tasks;
    }
}

export default ApiService;
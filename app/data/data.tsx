// Types
export type User = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    projectIds: string[];
    teamIds: string[];
};

export type Project = {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on_hold';
    teamId?: string;
    taskStatuses: string[];
    createdAt: string;
    dueDate?: string;
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

export type Task = {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    createdAt: string;
    project?: {
        id: string;
        name: string;
    };
    assignedTo: string; // userId
    createdBy: string; // userId
    tags: string[];
    attachments: Attachment[];
    comments: Comment[];
};

export type Comment = {
    id: string;
    taskId: string;
    content: string;
    createdAt: string;
    createdBy: string; // userId
    attachments: Attachment[];
};

export type Attachment = {
    id: string;
    name: string;
    type: 'image' | 'document' | 'other';
    url: string;
    size: number; // in bytes
    createdAt: string;
};

// Updated Dummy Data
export const currentUser: User = {
    id: 'user1',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    avatar: '/api/placeholder/32/32',
    role: 'Product Designer',
    projectIds: ['proj1', 'proj2'],
    teamIds: ['team1', 'team2']
};

export const tasks: Task[] = [
    {
        id: 'task1',
        title: 'Design new dashboard layout',
        description: 'Create wireframes and high-fidelity designs for the new admin dashboard',
        status: 'in_design',
        priority: 'high',
        dueDate: '2024-01-15',
        createdAt: '2024-01-01',
        project: {
            id: 'proj1',
            name: 'Website Redesign'
        },
        assignedTo: 'user1',
        createdBy: 'user1',
        tags: ['design', 'ui/ux'],
        attachments: [
            {
                id: 'att1',
                name: 'dashboard-wireframe.fig',
                type: 'document',
                url: '/files/dashboard-wireframe.fig',
                size: 2048576,
                createdAt: '2024-01-02'
            }
        ],
        comments: [
            {
                id: 'com1',
                taskId: 'task1',
                content: 'Initial wireframes completed, ready for review',
                createdAt: '2024-01-02',
                createdBy: 'user1',
                attachments: []
            }
        ]
    },
    {
        id: 'task2',
        title: 'Mobile navigation patterns',
        description: 'Research and design mobile navigation patterns for the app',
        status: 'todo',
        priority: 'medium',
        dueDate: '2024-01-20',
        createdAt: '2024-01-03',
        project: {
            id: 'proj2',
            name: 'Mobile App'
        },
        assignedTo: 'user1',
        createdBy: 'user3',
        tags: ['mobile', 'navigation', 'research'],
        attachments: [],
        comments: []
    },
    {
        id: 'task4',
        title: 'Organize design resources',
        description: 'Sort and tag design resources in the shared drive for easy access by the team members and new hires in the future',
        status: 'in_progress',
        priority: 'low',
        dueDate: '2024-01-18',
        createdAt: '2024-01-05',
        assignedTo: 'user1',
        createdBy: 'user1',
        tags: ['organization', 'resources'],
        attachments: [],
        comments: []
    },
    {
        id: 'task5',
        title: 'Learn advanced Figma techniques',
        description: 'Complete an online course on advanced Figma features',
        status: 'todo',
        priority: 'medium',
        dueDate: '2024-02-01',
        createdAt: '2024-01-04',
        assignedTo: 'user1',
        createdBy: 'user1',
        tags: ['learning', 'design'],
        attachments: [],
        comments: []
    },
    {
        id: 'task6',
        title: 'Test mobile app prototype',
        description: 'Conduct usability testing on the mobile app prototype',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2024-01-25',
        createdAt: '2024-01-07',
        project: {
            id: 'proj2',
            name: 'Mobile App'
        },
        assignedTo: 'user3',
        createdBy: 'user1',
        tags: ['testing', 'usability'],
        attachments: [],
        comments: []
    }
];

// Personal tasks for the current user
export const personalTasks: Task[] = [
    {
        id: 'task4',
        title: 'Organize design resources',
        description: 'Sort and tag design resources in the shared drive for easy access by the team members and new hires in the future',
        status: 'in_progress',
        priority: 'low',
        dueDate: '2024-01-18',
        createdAt: '2024-01-05',
        assignedTo: 'user1',
        createdBy: 'user1',
        tags: ['organization', 'resources'],
        attachments: [],
        comments: []
    },
    {
        id: 'task5',
        title: 'Learn advanced Figma techniques',
        description: 'Complete an online course on advanced Figma features',
        status: 'todo',
        priority: 'medium',
        dueDate: '2024-02-01',
        createdAt: '2024-01-04',
        assignedTo: 'user1',
        createdBy: 'user1',
        tags: ['learning', 'design'],
        attachments: [],
        comments: []
    }
];

// Tasks from all projects the user is involved in
export const allProjectTasks: Task[] = [
    {
        id: 'task1',
        title: 'Design new dashboard layout',
        description: 'Create wireframes and high-fidelity designs for the new admin dashboard',
        status: 'in_design',
        priority: 'high',
        dueDate: '2024-01-15',
        createdAt: '2024-01-01',
        project: {
            id: 'proj1',
            name: 'Website Redesign'
        },
        assignedTo: 'user1',
        createdBy: 'user1',
        tags: ['design', 'ui/ux'],
        attachments: [
            {
                id: 'att1',
                name: 'dashboard-wireframe.fig',
                type: 'document',
                url: '/files/dashboard-wireframe.fig',
                size: 2048576,
                createdAt: '2024-01-02'
            }
        ],
        comments: [
            {
                id: 'com1',
                taskId: 'task1',
                content: 'Initial wireframes completed, ready for review',
                createdAt: '2024-01-02',
                createdBy: 'user1',
                attachments: []
            }
        ]
    },
    {
        id: 'task2',
        title: 'Mobile navigation patterns',
        description: 'Research and design mobile navigation patterns for the app',
        status: 'todo',
        priority: 'medium',
        dueDate: '2024-01-20',
        createdAt: '2024-01-03',
        project: {
            id: 'proj2',
            name: 'Mobile App'
        },
        assignedTo: 'user1',
        createdBy: 'user3',
        tags: ['mobile', 'navigation', 'research'],
        attachments: [],
        comments: []
    },
    {
        id: 'task6',
        title: 'Test mobile app prototype',
        description: 'Conduct usability testing on the mobile app prototype',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2024-01-25',
        createdAt: '2024-01-07',
        project: {
            id: 'proj2',
            name: 'Mobile App'
        },
        assignedTo: 'user3',
        createdBy: 'user1',
        tags: ['testing', 'usability'],
        attachments: [],
        comments: []
    }
];

export const userProjects: Project[] = [
    {
        id: 'proj1',
        name: 'Website Redesign',
        description: 'Redesigning the company website with new branding',
        status: 'active',
        taskStatuses: ['backlog', 'in_design', 'in_development', 'in_review', 'done'],
        createdAt: '2024-01-01',
        dueDate: '2024-03-30'
    },
    {
        id: 'proj2',
        name: 'Mobile App',
        description: 'Developing a new mobile app for customers',
        status: 'active',
        taskStatuses: ['todo', 'in_progress', 'testing', 'qa_review', 'completed'],
        createdAt: '2024-01-15',
        dueDate: '2024-06-30'
    }
];

export const projects: Project[] = [
    {
        id: 'proj1',
        name: 'Website Redesign',
        description: 'Redesigning the company website with new branding',
        status: 'active',
        taskStatuses: ['backlog', 'in_design', 'in_development', 'in_review', 'done'],
        createdAt: '2024-01-01',
        dueDate: '2024-03-30'
    },
    {
        id: 'proj2',
        name: 'Mobile App',
        description: 'Developing a new mobile app for customers',
        status: 'active',
        taskStatuses: ['todo', 'in_progress', 'testing', 'qa_review', 'completed'],
        createdAt: '2024-01-15',
        dueDate: '2024-06-30'
    },
    {
        id: 'proj3',
        name: 'Internal Tooling',
        description: 'Building internal tools for better efficiency',
        status: 'on_hold',
        taskStatuses: ['planning', 'development', 'review', 'completed'],
        createdAt: '2024-02-01',
    },
    {
        id: 'proj4',
        name: 'Marketing Campaign',
        description: 'Launching a new marketing campaign for Q2',
        status: 'active',
        taskStatuses: ['idea', 'design', 'execution', 'completed'],
        createdAt: '2024-03-01',
        dueDate: '2024-04-15'
    }
];

// Combined view of tasks for the current user
export const userVisibleTasks: Task[] = [
    ...personalTasks,
    ...allProjectTasks.filter(task => task.project && currentUser.projectIds.includes(task.project.id))
];

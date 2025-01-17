import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        padding: 24,
        paddingTop: 20,
    },
    welcomeText: {
        fontSize: 16,
        color: '#B0B0B0',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    content: {
        padding: 16,
    },
    tasksContainer: {
        gap: 12,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
    },
    projectContainer: {
        backgroundColor: '#1E1E1E',
        gap: 12,
        borderRadius: 16,
        marginBottom: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    projectHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    projectIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    projectIconText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    projectTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    taskCard: {
        borderBottomColor: '#333',
        borderBottomWidth: 1,
        paddingBottom: 8,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
        flex: 1,
    },
    taskDescription: {
        fontSize: 14,
        color: '#B0B0B0',
        marginBottom: 12,
        lineHeight: 20,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    taskDate: {
        fontSize: 12,
        color: '#808080',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        marginTop: 20,
    },
    emptyText: {
        color: '#808080',
        fontSize: 16,
        marginTop: 12,
        textAlign: 'center',
    },
    noTasksText: {
        color: '#808080',
        fontSize: 16,
        textAlign: 'center',
    },
});
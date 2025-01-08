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
    userName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    sectionContainer: {
        gap: 16,
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 16,
        backgroundColor: '#1E1E1E',
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
    sectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 7,
    },
    sectionHeader: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 12,
    },
    projectContainer: {
        marginBottom: 24,
        gap: 16,
    },
    projectHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 7,
    },
    projectIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    projectIconText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    projectHeader: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    taskLink: {
        textDecorationLine: 'none',
        width: '100%',
        borderBottomColor: '#333',
        borderBottomWidth: 1,
        paddingBottom: 8,
    },
    taskCard: {
        borderRadius: 12,
        marginBottom: 12,
        width: '100%',
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
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
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
    dueDate: {
        fontSize: 12,
        color: '#808080',
    },
    emptyStateContainer: {
        alignItems: 'center',
        padding: 32,
    },
    noTasks: {
        color: '#808080',
        fontSize: 16,
        marginTop: 12,
        textAlign: 'center',
    },
});
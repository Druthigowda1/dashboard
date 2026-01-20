import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    TextField,
    MenuItem,
    Modal,
    IconButton,
    InputAdornment,
    Container,
    AppBar,
    Toolbar,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    Card,
    CardContent
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';

export default function AdminDashboard() {
    const { logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', assignedToId: '', taskDate: new Date().toISOString().split('T')[0] });

    // Filtering
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterEmployeeId, setFilterEmployeeId] = useState('');

    // Employee Management Modal State
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [employeeForm, setEmployeeForm] = useState({ username: '', password: '' });

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, [filterDate, filterEmployeeId]);

    const fetchTasks = async () => {
        try {
            let url = `http://localhost:3000/api/tasks?date=${filterDate}`;
            const res = await axios.get(url);
            let data = res.data;
            if (filterEmployeeId) {
                data = data.filter(t => t.assignedToId === Number(filterEmployeeId));
            }
            setTasks(data);
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/tasks/users');
            setUsers(res.data);
        } catch (err) { console.error(err); }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/tasks', newTask);
            fetchTasks();
            setNewTask({ title: '', description: '', assignedToId: '', taskDate: new Date().toISOString().split('T')[0] });
            alert('Task Assigned!');
        } catch (err) { console.error(err); }
    };

    // Employee Management Logic
    const openEmployeeModal = (emp = null) => {
        setEditingEmployee(emp);
        setEmployeeForm(emp ? { username: emp.username, password: '' } : { username: '', password: '' });
        setShowEmployeeModal(true);
    };

    const handleSaveEmployee = async (e) => {
        e.preventDefault();
        try {
            if (editingEmployee) {
                // Update
                const payload = { username: employeeForm.username };
                if (employeeForm.password) payload.password = employeeForm.password;
                await axios.patch(`http://localhost:3000/api/users/${editingEmployee.id}`, payload);
                alert('Employee updated!');
            } else {
                // Create
                await axios.post('http://localhost:3000/api/auth/register', { ...employeeForm, role: 'EMPLOYEE' });
                alert('Employee added!');
            }
            fetchUsers();
            setShowEmployeeModal(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Error saving employee');
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm('Are you sure? This will delete the employee and ALL their tasks.')) return;
        try {
            await axios.delete(`http://localhost:3000/api/users/${id}`);
            fetchUsers();
            fetchTasks();
            alert('Employee deleted');
        } catch (err) {
            alert(err.response?.data?.error || 'Error deleting employee');
        }
    };

    // Modal Style
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        overflow: 'hidden',
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {/* Header */}
            <AppBar position="static" sx={{ backgroundColor: 'white', color: '#1f2937', boxShadow: 1 }}>
                <Toolbar>
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        Admin Dashboard
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<GroupIcon />}
                            onClick={() => openEmployeeModal()}
                            sx={{ textTransform: 'none', backgroundColor: '#9333ea', '&:hover': { backgroundColor: '#7e22ce' } }}
                        >
                            Manage Employees
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={logout}
                            sx={{ textTransform: 'none' }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
                {/* Filters */}
                <Paper sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>
                        Report Filters:
                    </Typography>
                    <TextField
                        type="date"
                        label="Date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        select
                        label="Employee Filter"
                        value={filterEmployeeId}
                        onChange={e => setFilterEmployeeId(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value=""><em>All Employees</em></MenuItem>
                        {users.map(u => (
                            <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>
                        ))}
                    </TextField>
                </Paper>

                <Grid container spacing={4}>
                    {/* Left Column: Create Task */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderTop: '4px solid #3b82f6', height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <AssignmentIcon color="primary" />
                                <Typography variant="h6" fontWeight="bold">
                                    Assign New Task
                                </Typography>
                            </Box>

                            <form onSubmit={handleCreateTask}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label="Task Title"
                                        variant="outlined"
                                        fullWidth
                                        value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                        required
                                    />
                                    <TextField
                                        label="Description"
                                        variant="outlined"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        value={newTask.description}
                                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                        required
                                    />
                                    <TextField
                                        type="date"
                                        label="Due Date"
                                        variant="outlined"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={newTask.taskDate}
                                        onChange={e => setNewTask({ ...newTask, taskDate: e.target.value })}
                                        required
                                    />
                                    <TextField
                                        select
                                        label="Assign To"
                                        variant="outlined"
                                        fullWidth
                                        value={newTask.assignedToId}
                                        onChange={e => setNewTask({ ...newTask, assignedToId: e.target.value })}
                                        required
                                    >
                                        <MenuItem value=""><em>Select Employee...</em></MenuItem>
                                        {users.map(u => (
                                            <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>
                                        ))}
                                    </TextField>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        sx={{ mt: 1, backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } }}
                                    >
                                        Assign Task
                                    </Button>
                                </Box>
                            </form>
                        </Paper>
                    </Grid>

                    {/* Right Column: Task List */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, minHeight: '500px', borderTop: '4px solid #3b82f6', border: '1px solid #3b82f6', width: '900px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Tasks Report
                                </Typography>
                                <Chip
                                    icon={<EventIcon />}
                                    label={new Date(filterDate).toLocaleDateString()}
                                    variant="outlined"
                                />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '800px', overflowY: 'auto', pr: 1, }}>
                                {tasks.map(task => (
                                    <Card key={task.id} variant="outlined" sx={{ '&:hover': { boxShadow: 2 } }}>
                                        <CardContent sx={{ border: '1px solid black', borderRadius: '10px' }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={8}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <Typography variant="h6" fontWeight="bold">
                                                            {task.title}
                                                        </Typography>
                                                        <Chip
                                                            label={task.status}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                bgcolor: task.status === 'COMPLETED' ? '#dcfce7' : '#fef9c3',
                                                                color: task.status === 'COMPLETED' ? '#166534' : '#854d0e',
                                                                fontSize: '0.7rem'
                                                            }}
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                        {task.description}
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', gap: 3 }}>
                                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <strong>Assigned:</strong> {task.assignedTo?.username}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <strong>Date:</strong> {new Date(task.taskDate).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                </Grid>

                                                {task.submission && (
                                                    <Grid item xs={12} md={4}>
                                                        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f9fafb', height: '100%' }}>
                                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                                                Employee Update
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                                "{task.submission}"
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                                {tasks.length === 0 && (
                                    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary', border: '1px dashed #e5e7eb', borderRadius: 2 }}>
                                        <Typography>No tasks found for this date/filter.</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Employee Management Modal */}
            <Modal
                open={showEmployeeModal}
                onClose={() => setShowEmployeeModal(false)}
                aria-labelledby="modal-modal-title"
            >
                <Box sx={modalStyle}>
                    <Box sx={{ bgcolor: '#9333ea', color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography id="modal-modal-title" variant="h6" fontWeight="bold">
                            Manage Employees
                        </Typography>
                        <IconButton onClick={() => setShowEmployeeModal(false)} size="small" sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ p: 3, maxHeight: '80vh', overflowY: 'auto' }}>
                        {/* Form */}
                        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fafafa' }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonAddIcon fontSize="small" />
                                {editingEmployee ? `Edit Employee: ${editingEmployee.username}` : 'Add New Employee'}
                            </Typography>

                            <form onSubmit={handleSaveEmployee}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Username"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            value={employeeForm.username}
                                            onChange={e => setEmployeeForm({ ...employeeForm, username: e.target.value })}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            type="password"
                                            label={editingEmployee ? "New Password" : "Password"}
                                            placeholder={editingEmployee ? "Leave blank to keep" : ""}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            value={employeeForm.password}
                                            onChange={e => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                                            required={!editingEmployee}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            fullWidth
                                            sx={{ bgcolor: '#9333ea', '&:hover': { bgcolor: '#7e22ce' } }}
                                        >
                                            {editingEmployee ? 'Update User' : 'Add User'}
                                        </Button>
                                        {editingEmployee && (
                                            <Button
                                                onClick={() => openEmployeeModal(null)}
                                                variant="outlined"
                                                color="inherit"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>

                        {/* Employee List */}
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            All Employees ({users.length})
                        </Typography>
                        <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                            <List dense>
                                {users.length === 0 ? (
                                    <ListItem>
                                        <ListItemText primary="No employees found" />
                                    </ListItem>
                                ) : (
                                    users.map(u => (
                                        <div key={u.id}>
                                            <ListItem>
                                                <Box sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: '#e0e7ff',
                                                    color: '#4338ca',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2,
                                                    fontWeight: 'bold',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {u.username.charAt(0).toUpperCase()}
                                                </Box>
                                                <ListItemText primary={u.username} />
                                                <ListItemSecondaryAction>
                                                    <IconButton edge="end" aria-label="edit" onClick={() => openEmployeeModal(u)} sx={{ color: '#2563eb', mr: 1 }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteEmployee(u.id)} sx={{ color: '#ef4444' }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <Divider component="li" />
                                        </div>
                                    ))
                                )}
                            </List>
                        </Paper>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}

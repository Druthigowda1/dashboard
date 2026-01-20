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
    Chip,
    AppBar,
    Toolbar,
    Container,
    Card,
    CardContent,
    CardActionArea
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function EmployeeDashboard() {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [submission, setSubmission] = useState('');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchTasks();
    }, [filterDate]);

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/tasks?date=${filterDate}`);
            setTasks(res.data);
        } catch (err) { console.error(err); }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        if (!selectedTask) return;
        try {
            await axios.patch(`http://localhost:3000/api/tasks/${selectedTask.id}`, {
                status: 'COMPLETED',
                submission
            });
            fetchTasks();
            setSelectedTask(null);
            setSubmission('');
        } catch (err) { console.error(err); }
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {/* Header */}
            <AppBar position="static" sx={{ backgroundColor: 'white', color: '#1f2937', boxShadow: 1 }}>
                <Toolbar>
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        Welcome, {user?.username}
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={logout}
                        sx={{ textTransform: 'none' }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
                {/* Date Filter */}
                <Paper sx={{ p: 2, mb: 4, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium">Select Date:</Typography>
                    <TextField
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ input: { padding: '8px 14px' } }}
                    />
                </Paper>

                <Grid container spacing={4}>
                    {/* My Tasks List */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%', minHeight: '400px', backgroundColor: 'white' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                My Tasks ({new Date(filterDate).toLocaleDateString()})
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {tasks.map(task => (
                                    <Card
                                        key={task.id}
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 2,
                                            border: selectedTask?.id === task.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                            transition: 'all 0.2s',
                                            '&:hover': { boxShadow: 2, borderColor: '#3b82f6' }
                                        }}
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        <CardActionArea sx={{ p: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {task.title}
                                                </Typography>
                                                <Chip
                                                    label={task.status}
                                                    size="small"
                                                    color={task.status === 'COMPLETED' ? 'success' : 'warning'}
                                                    variant="soft"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        backgroundColor: task.status === 'COMPLETED' ? '#dcfce7' : '#fef9c3',
                                                        color: task.status === 'COMPLETED' ? '#166534' : '#854d0e'
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {task.description}
                                            </Typography>
                                        </CardActionArea>
                                    </Card>
                                ))}
                                {tasks.length === 0 && (
                                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                                        No tasks assigned for this date.
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Update Task Panel */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            sx={{
                                p: 3,
                                height: '100%',
                                borderTop: '4px solid #22c55e',
                                position: 'relative'
                            }}
                        >
                            {selectedTask ? (
                                <Box component="form" onSubmit={handleUpdateTask}>
                                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                                        Update Task: {selectedTask.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        {selectedTask.description}
                                    </Typography>

                                    <TextField
                                        placeholder="Enter your progress or completion notes here..."
                                        multiline
                                        rows={6}
                                        fullWidth
                                        variant="outlined"
                                        value={submission}
                                        onChange={e => setSubmission(e.target.value)}
                                        required
                                        sx={{ mb: 3 }}
                                    />

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                        <CheckCircleOutlineIcon color="success" />
                                        <Typography variant="body2" fontWeight="medium">
                                            Marking this task as completed.
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="success"
                                                fullWidth
                                                size="large"
                                                sx={{ textTransform: 'none', fontWeight: 'bold' }}
                                            >
                                                Submit Update
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button
                                                type="button"
                                                onClick={() => setSelectedTask(null)}
                                                color="inherit"
                                                fullWidth
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Cancel
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                                    <Typography variant="body1">
                                        Select a task from the list to update its status.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

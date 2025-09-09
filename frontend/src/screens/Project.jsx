import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';

const Project = () => {
    const location = useLocation();

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());
    const [project, setProject] = useState(location.state?.project || {});
    const [users, setUsers] = useState([]);


    // This logic is now simpler and more direct
    const handleUserClick = (id) => {
        setSelectedUserIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(id)) {
                newIds.delete(id);
            } else {
                newIds.add(id);
            }
            return newIds;
        });
    };

    const addCollaborators = () => {
        if (!project._id) return;
        axios.put("/projects/add-user", {
            projectId: project._id,
            users: Array.from(selectedUserIds) // Sends the correct array of IDs
        }).then(res => {
            setIsModalOpen(false);
            // Refresh project data to show the new collaborator immediately
            axios.get(`/projects/get-project/${project._id}`).then(res => {
                setProject(res.data.project);
            });
        }).catch(err => {
            console.error("Error adding collaborators:", err);
        });
    };

    useEffect(() => {
        const socket = initializeSocket();
        // If initialization fails (e.g., no token), the socket will be null. Stop here.
        if (!socket) {
            return; 
        }
        
        // Guard clause to prevent API calls if there's no project ID
        if (!project._id) return;
       // initializeSocket();
        axios.get(`/projects/get-project/${project._id}`).then(res => {
            setProject(res.data.project);
        });

        axios.get('/users/all').then(res => { 
            setUsers(res.data.users);
        }).catch(err => {
            console.error("Error fetching users:", err);
        });
    }, [project._id]); // Added dependency to refetch if project._id changes

    return (
        <main className='h-screen w-screen flex'>
            <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
                {/* Header */}
                <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0'>
                    <button className='flex gap-2' onClick={() => setIsModalOpen(true)}>
                        <i className="ri-add-fill mr-1"></i>
                        <p>Add collaborator</p>
                    </button>
                    <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'>
                        <i className="ri-group-fill"></i>
                    </button>
                </header>

                {/* Conversation Area */}
                <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
                    <div className="inputField w-full flex absolute bottom-0">
                        <input className='p-2 px-4 border-none outline-none flex-grow' type="text" placeholder='Enter message' />
                        <button className='px-5 bg-slate-950 text-white'><i className="ri-send-plane-fill"></i></button>
                    </div>
                </div>

                {/* Side Panel for Collaborators */}
                <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0`}>
                    <header className='flex justify-between items-center px-4 p-2 bg-slate-200'>
                        <h1 className='font-semibold text-lg'>Collaborators</h1>
                        <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'>
                            <i className="ri-close-fill"></i>
                        </button>
                    </header>
                    <div className="users flex flex-col gap-2">
                        {/* Robust rendering: filter for valid users with an _id */}
                        {project.users && project.users.filter(user => user && user._id).map(user => (
                            <div key={user._id} className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
                                <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                    <i className="ri-user-fill absolute"></i>
                                </div>
                                <h1 className='font-semibold text-lg'>{user.email}</h1>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modal for Adding Collaborators */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
                        <header className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>Select User</h2>
                            <button onClick={() => setIsModalOpen(false)} className='p-2'>
                                <i className="ri-close-fill"></i>
                            </button>
                        </header>
                        <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
                            {/* Robust rendering: filter for valid users with an _id */}
                            {users.filter(user => user && user._id).map(user => (
                                <div key={user._id} className={`user cursor-pointer hover:bg-slate-200 ${selectedUserIds.has(user._id) ? 'bg-slate-200' : ""} p-2 flex gap-2 items-center`} onClick={() => handleUserClick(user._id)}>
                                    <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>
                            ))}
                        </div>
                        <button onClick={addCollaborators} className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md'>
                            Add Collaborators
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Project;

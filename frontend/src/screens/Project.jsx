import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import { UserContext } from '../context/user.context';

const Project = () => {
    const location = useLocation();
    

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());
    const [project, setProject] = useState(location.state?.project || {});
    const [users, setUsers] = useState([]);
    const [ message, setMessage ] = useState('')
    const { user } = useContext(UserContext);
    const messageBox = useRef(null);



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

    function send(){
        sendMessage('project-message', { 
            message,
            sender: user
        });
        appendOutgoingMessage(message);
        setMessage('');
    }

    useEffect(() => {
        const socket = initializeSocket(project._id);
        if (!socket) return;

        // Define the handler function
        const handler = (data) => {
            console.log(data);
            appendIncomingMessage(data);
        };

        // Add the listener
        socket.on('project-message', handler);

        // Fetch project and users
        axios.get(`/projects/get-project/${project._id}`).then(res => {
            setProject(res.data.project);
        });

        axios.get('/users/all').then(res => { 
            setUsers(res.data.users);
        }).catch(err => {
            console.error("Error fetching users:", err);
        });

        // Cleanup: remove the listener when project._id changes or component unmounts
        return () => {
            socket.off('project-message', handler);
        };
    }, [project._id]);

    function appendIncomingMessage(messageObject) {
        const messageBox = document.querySelector('.message-box');
        const message = document.createElement('div');

        // Styling for incoming messages
        message.classList.add('message', 'max-w-xs', 'p-3', 'rounded-xl', 'bg-slate-200', 'mb-2', 'flex', 'flex-col', 'gap-1');
        
        message.innerHTML = `
            <small class='opacity-70 text-xs'>${messageObject.sender.email}</small>
            <p class='text-sm'>${messageObject.message}</p>
        `;
        
        messageBox.appendChild(message);
        scrollToBottom();
    }

    function appendOutgoingMessage(message){
        const messageBox = document.querySelector('.message-box');
        const newMessage = document.createElement('div');
        newMessage.classList.add('message', 'ml-auto', 'max-w-xs', 'p-3', 'rounded-xl', 'bg-blue-500', 'text-white', 'mb-2', 'flex', 'flex-col', 'gap-1');
        newMessage.innerHTML = `
            <small class='opacity-70 text-xs'>${user.email}</small>
            <p class='text-sm'>${message}</p>
        `;
        messageBox.appendChild(newMessage);
        scrollToBottom();
    }

     function scrollToBottom() {
        // Add a check for messageBox.current
        if (messageBox.current) {
            // Use setTimeout to run after the DOM has updated
            setTimeout(() => {
                messageBox.current.scrollTop = messageBox.current.scrollHeight;
            }, 0);
        }
    }


    return (
        <main className='h-screen w-screen flex'>
            <section className="left fixed left-0 top-0 flex flex-col h-screen min-w-96 bg-slate-300">
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
                    <div
                        ref={messageBox}
                        className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide">
                        
                    </div>
                    <div className="inputField w-full flex absolute bottom-0">
                        <input 
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className='p-2 px-4 border-none outline-none flex-grow bg-white' type="text" placeholder='Enter message' />
                        <button 
                            onClick={send}
                        className='px-5 bg-slate-950 text-white'><i className="ri-send-plane-fill"></i></button>
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

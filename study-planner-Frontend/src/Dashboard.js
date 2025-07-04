// import './App.css';
import './Dashboard.css'
import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import API from './services/api';

function App() {

    const [data, Dataset] = useState([]);

    const [hours, setHours] = useState(0);
    const [subject, setSubject] = useState("");
    const [examDate, setExamDate] = useState(new Date());
    const [syllabus, setSyllabus] = useState(null);
    const [level, setLevel] = useState("");
    const [comments, setComments] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [darkMode, setDarkMode] = useState(false);


    useEffect(() => {
        API.get('/exam').then((response) => {
            console.log("Backend Response:", response.data);
            Dataset(response.data);
        })
    }, []);

    const addSubject = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('sub', subject);
        formData.append('date', examDate.toISOString());
        formData.append('syllabus', syllabus);
        formData.append('DifficultyLevel', level);
        formData.append('comments', comments);

        try {
            const response = await API.post('/exam', formData);
            Dataset([...data, response.data]);

            setSubject('');
            setExamDate(new Date());
            setSyllabus(null);
            setLevel('');
            setComments('');

            // Show toast
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setLoading(false);
        }
    };


    const deleteSubject = (id) => {
        API.delete(`/exam/${id}`).then(() => {
            Dataset(data.filter((info) => info._id !== id));
        });
    };

    const showSubjectform = () => {
        return (
            <div>
                <form>
                    <fieldset style={{ margin: '0 auto', width: '50%' }}>
                        <legend>Please Fill All Details Compulsory!!! </legend>
                        <div className="form-container">
                            <label>Subject Name:</label>
                            <input
                                type='text'
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder='Enter Subject Name'
                            /><br></br>

                            <label>Exam Date:</label>
                            <input
                                type='date'
                                value={examDate.toISOString().substring(0, 10)}
                                onChange={(e) => setExamDate(new Date(e.target.value))}
                            /><br></br>

                            <label>Syllabus:</label>
                            <input
                                type='file'
                                accept='.pdf'
                                onChange={(e) => setSyllabus(e.target.files[0])}
                            /><br></br>

                            <label>Difficulty Level:</label>
                            <select value={level} onChange={(e) => setLevel(e.target.value)}>
                                <option value=''>Select Level</option>
                                <option value='easy'>Easy</option>
                                <option value='medium'>Medium</option>
                                <option value='hard'>Hard</option>
                            </select><br></br>

                            <label>Comments:</label><br></br>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder='which chapter you feel hard and which are important that you want to cover first!!!'
                                rows={5}
                                cols={50}
                            ></textarea><br></br>

                            {/* <button className="add-subject-button" onClick={addSubject}>Add Subject</button> */}
                            <button className="add-subject-button" onClick={addSubject} disabled={loading}>
                                {loading ? <span className="spinner"></span> : "Add Subject"}
                            </button>

                        </div>
                    </fieldset>
                </form>
                {showToast && (
                    <div className="toast">✅ Subject added successfully!</div>
                )}

            </div>
        )
    }
    return (
        <div>
            <button
                onClick={() => {
                    setDarkMode(!darkMode);
                    document.body.classList.toggle('dark');
                }}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: darkMode ? '#66ccff' : '#007acc',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '10px 20px',
                    cursor: 'pointer'
                }}
            >
                {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <h1>SMART STUDY PLANNER</h1>
            <h3>Let's plan together to crack exams</h3>
            <div className="study-hours">
                <label>Hours of Study per Day:</label>
                <input
                    type='number'
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                />
            </div>

            <div className="add-subject">
                <button className="plus-button" onClick={() => setShowForm((view) => !view)}>+</button>
                <label>Add Subject</label>
            </div>

            {showForm && (
                <div className="subject-form">
                    {showSubjectform()}
                </div>
            )}

            <br></br><br></br>
            <h2>Stored Subject</h2>
            <table border="1" align='center'>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Exam Date</th>
                        <th>Syllabus</th>
                        <th>Difficulty Level</th>
                        <th>comments</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {/* {data.map((info) => (
                        <tr key={info._id}>
                            <td>{info.sub}</td>
                            <td>{new Date(info.date).toISOString().split('T')[0]}</td>
                            
                            <td>{info.syllabus ? (
                                <a href={`/${info.syllabus}`} target="_blank" rel="noopener noreferrer">
                                    View Syllabus
                                </a>
                            ) : (
                                "No syllabus uploaded"
                            )}</td>
                            <td>{info.DifficultyLevel}</td>
                            <td>{info.comments}</td>
                            <td>
                                <button onClick={() => deleteSubject(info._id)}>Delete Subject</button>
                            </td>
                        </tr>
                    ))} */}

                    {data.map((info, index) => {
                        const isValidDate = info.date && !isNaN(new Date(info.date));

                        return (
                            <tr key={info._id || index}>
                                <td>{info.sub}</td>
                                <td>
                                    {isValidDate
                                        ? new Date(info.date).toISOString().split('T')[0]
                                        : "Invalid date"}
                                </td>
                                <td>
                                    {info.syllabus ? (
                                        <a href={`/${info.syllabus}`} target="_blank" rel="noopener noreferrer">
                                            View Syllabus
                                        </a>
                                    ) : (
                                        "No syllabus uploaded"
                                    )}
                                </td>
                                <td>{info.DifficultyLevel}</td>
                                <td>
                                    {Array.isArray(info.comments) ? (
                                        info.comments.map((comment, i) => <div key={i}>{comment}</div>)
                                    ) : (
                                        info.comments
                                    )}
                                </td>
                                <td>
                                    <button onClick={() => deleteSubject(info._id)}>Delete Subject</button>
                                </td>
                            </tr>
                        );
                    })}


                </tbody>
            </table>
        </div>
    );
}

export default App;

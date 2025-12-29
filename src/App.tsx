import { useState, type ChangeEvent, type FC } from "react";
import Papa from "papaparse";

// --- Types ---
interface FeedbackRow {
    reviewer: string;
    student: string;
    planning: string;
    cooking: string;
    cleaning: string;
    comments: string;
}

interface ReflectionRow {
    name: string;
    professional: string;
    engagement: string;
    instructions: string;
    sousChef: string;
    recipe: string;
    questions: string;
    project: string;
}

const professionalResponses = {
    "I can sometimes participate in Foods class in a professional manner": 2,
    "I can usually participate in Foods class in a professional manner": 3,
    "I can always participate in Foods class in a professional manner": 4,
    "I can work towards participating in Foods class in a professional manner": 2,
}

const engagementResponses = {
    "I get bored when watching the cooking videos": 2,
    "I like to talk to my teammate about what is happening in the video": 3,
    "I like to think about how to put the recipe together when watching to cooking videos": 4,
    "I don't find the videos useful": 2,
}

const instructionResponses = {
    "I stop for instructions on cooking days but get distracted": 2,
    "I stop to HEAR the instructions from Mrs. K on cooking days": 3,
    "I stop to LISTEN to the instructions from Mrs. K on cooking days": 4,
    "I am usually too busy in the kitchen to stop and listen to instructions on cooking days": 2,
}

const sousChefResponses = {
    "I will reluctantly be the sous chef": 2,
    "I don't mind being the sous chef": 3,
    "I love being the sous chef": 4,
    "I avoid being the sous chef": 2,
}

const recipeResponses = {
    "I like to learn how to make a recipe by watching my teammates": 2,
    "I reference the recipe while cooking": 3,
    "I follow the recipe instructions step by step": 4,
    "My favorite thing to do in the kitchen is to get the ingredients": 2,
}

const questionsResponses = {
    "I am too embarrassed or too shy to ask questions about cooking": 2,
    "I ask clarifying questions while COOKING": 3,
    "I ask clarifying questions while PLANNING": 4,
    "I ask what I need to do next while cooking": 2,
}

const projectResponses = {
    "I haven't started": 1,
    "I have yet to contribute to the magazine": 1,
    "I have done one of these things": 2,
    "Some of the recipes we have made so far are": 2,
    "I have contributed in one or two of these ways": 2,
    "I have done two of these things": 2,
    "Most of the recipes we have made so far are in my recipe book": 3,
    "I have contributed in three of these ways": 3,
    "I have done three of these things": 3,
    "All the recipes we have made so far are in my recipe book": 4,
    "I have contributed to the magazine in all of these ways": 4,
    "I have done all of these things": 4,
}

interface StudentFeedbackProps {
    student: string;
    feedback: FeedbackRow[];
}

interface StudentReflectionProps {
    student: string;
    reflection: ReflectionRow;
}

interface MergeModalProps {
    students: string[];
    onMerge: (source: string, target: string) => void;
    onClose: () => void;
}

const mapReflection = (response: string, choices: Record<string, number>) => {
    for(const choice of Object.keys(choices)) {
        if(response.toLowerCase().trim().replace(/ +/g, ' ').includes(choice.toLowerCase().trim().replace(/ +/g, ' '))) {
            return choices[choice];
        }
    }
    alert("unknown response detected");
    return -Infinity;
}

const ReflectionTable: FC<StudentReflectionProps> = ({reflection}) => {
    const professional = mapReflection(reflection.professional, professionalResponses);
    const engagement = mapReflection(reflection.engagement, engagementResponses);
    const instructions = mapReflection(reflection.instructions, instructionResponses);
    const sousChef = mapReflection(reflection.sousChef, sousChefResponses);
    const recipe = mapReflection(reflection.recipe, recipeResponses);
    const questions = mapReflection(reflection.questions, questionsResponses);
    const project = mapReflection(reflection.project, projectResponses);

    const outcomeProfessionalism = professional;
    const outcomeInterest = (engagement + instructions + sousChef + recipe + questions) / 5;
    const outcomeProject = project;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <tr>
                    <td className="border p-2 font-semibold"><b>Question 1</b></td>
                    <td className="border p-2">{reflection.professional}</td>
                </tr>
                <tr>
                    <td className="border p-2 font-semibold"><b>Question 2</b></td>
                    <td className="border p-2">{reflection.engagement}</td>
                </tr>
                <tr>
                    <td className="border p-2 font-semibold"><b>Question 3</b></td>
                    <td className="border p-2">{reflection.instructions}</td>
                </tr>
                <tr>
                    <td className="border p-2 font-semibold"><b>Question 4</b></td>
                    <td className="border p-2">{reflection.sousChef}</td>
                </tr>
                <tr>
                    <td className="border p-2 font-semibold"><b>Question 5</b></td>
                    <td className="border p-2">{reflection.recipe}</td>
                </tr>
                <tr>
                    <td className="border p-2 font-semibold"><b>Question 6</b></td>
                    <td className="border p-2">{reflection.questions}</td>
                </tr>
                <tr>
                    <td className="border p-2 font-semibold"><b>Question 7</b></td>
                    <td className="border p-2">{reflection.project}</td>
                </tr>
            </table>
            <p><b>Professionalism:</b> {outcomeProfessionalism}</p>
            <p><b>Interest:</b> {outcomeInterest}</p>
            <p><b>SpecialProject:</b> {outcomeProject}</p>
        </div>
    );
}

// --- Components ---
const FeedbackTable: FC<StudentFeedbackProps> = ({ feedback}) => {
    const mapScore = (response: string): number => {
        const normalized = response.toLowerCase();
        if (normalized.includes("actively participated")) return 4;
        if (normalized.includes("somewhat participated")) return 2;
        if (normalized.includes("didn't participate") || normalized.includes("did not participate")) return 1;
        if (normalized.includes("participated")) return 3;
        return 0;
    };



    const planningScores = feedback.map(f => mapScore(f.planning));
    const cookingScores = feedback.map(f => mapScore(f.cooking));
    const cleaningScores = feedback.map(f => mapScore(f.cleaning));

    const meanPlanning = planningScores.reduce((prev, curr) => prev + curr, 0) / planningScores.length;
    const meanCooking = cookingScores.reduce((prev, curr) => prev + curr, 0) / cookingScores.length;
    const meanCleaning = cleaningScores.reduce((prev, curr) => prev + curr, 0) / cleaningScores.length;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Reviewer</th>
                        <th className="border p-2">Planning</th>
                        <th className="border p-2">Planning Score</th>
                        <th className="border p-2">Cooking</th>
                        <th className="border p-2">Cooking Score</th>
                        <th className="border p-2">Cleaning</th>
                        <th className="border p-2">Cleaning Score</th>
                        <th className="border p-2">Comments</th>
                    </tr>
                </thead>
                <tbody>
                    {feedback.map((f, i) => (
                        <tr key={i} className="odd:bg-gray-50">
                            <td className="border p-2 font-semibold">{f.reviewer}</td>
                            <td className="border p-2">{f.planning}</td>
                            <td className="border p-2 text-center">{mapScore(f.planning)}</td>
                            <td className="border p-2">{f.cooking}</td>
                            <td className="border p-2 text-center">{mapScore(f.cooking)}</td>
                            <td className="border p-2">{f.cleaning}</td>
                            <td className="border p-2 text-center">{mapScore(f.cleaning)}</td>
                            <td className="border p-2">{f.comments}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p><b>Average planning:</b> {meanPlanning.toFixed(2)}</p>
            <p><b>Average cooking:</b> {meanCooking.toFixed(2)}</p>
            <p><b>Average cleaning:</b> {meanCleaning.toFixed(2)}</p>

            <p><b>SpecialProject:</b> TODO</p>
        </div>
    );
};

const MergeModal: FC<MergeModalProps> = ({ students, onMerge, onClose }) => {
    const [source, setSource] = useState<string>(students[0] || "");
    const [target, setTarget] = useState<string>(students[1] || "");

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-4">Merge Students</h2>
                <div className="mb-4">
                    <label className="block mb-1">Source:</label>
                    <select value={source} onChange={e => setSource(e.target.value)} className="w-full border p-2 rounded">
                        {students.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Target:</label>
                    <select value={target} onChange={e => setTarget(e.target.value)} className="w-full border p-2 rounded">
                        {students.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-2">
                    <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={() => {
                            if (source !== target) onMerge(source, target);
                            onClose();
                        }}
                    >
                        Merge
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main App ---
const App: FC = () => {
    const [rows, setRows] = useState<FeedbackRow[]>([]);
    const [reflections, setReflections] = useState<Record<string, ReflectionRow>>({});
    const [search, setSearch] = useState<string>("");
    const [mergeOpen, setMergeOpen] = useState<boolean>(false);
    const [mode, setMode] = useState<boolean>(false);

    const normalizeName = (name: string | undefined): string => name?.trim().toLowerCase() || "";

    const handleUpload = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const [rows, reflection] = processData(result.data);
                setRows(rows);
                setReflections(reflection);
            },
        });
    };

    // --- Add inside your App component, before the return ---
    const handleExport = () => {
        if (rows.length === 0) return;
    
        // Sort rows by member/student name
        const sortedRows = [...rows].sort((a, b) =>
            a.student.localeCompare(b.student, undefined, { sensitivity: "base" })
        );

        // Convert rows to plain object for CSV
        const exportData = sortedRows.map(r => ({
            reviewer: r.reviewer,
            member: r.student,
            planning: r.planning,
            cooking: r.cooking,
            cleaning: r.cleaning,
            comments: r.comments,
        }));

        const csv = Papa.unparse(exportData);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "class_feedback.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const processData = (data: Record<string, string>[]): [FeedbackRow[], Record<string, ReflectionRow>] => {
        const feedback: FeedbackRow[] = [];
        let reflection: Record<string, ReflectionRow> = {};

        data.forEach((row) => {
            const keys = Object.keys(row);
            const reviewer = row[keys[2]]?.trim() || "";

            for (let i = 0; i < 5; i++) {
                const base = 10 + i * 5;
                let name = row[keys[base]];
                if (!name || name === "NA") continue;
                name = normalizeName(name);

                feedback.push({
                    reviewer,
                    student: name,
                    planning: row[keys[base + 1]] || "",
                    cooking: row[keys[base + 2]] || "",
                    cleaning: row[keys[base + 3]] || "",
                    comments: row[keys[base + 4]] || "",
                });
            }
        });

        data.forEach(row => {
            const keys = Object.keys(row);
            const name = row[keys[2]]?.trim();
            if(!name) return;

            reflection[name] = {
                name: name,
                professional: row[keys[3]],
                engagement: row[keys[4]],
                instructions: row[keys[5]],
                sousChef: row[keys[6]],
                recipe: row[keys[7]],
                questions: row[keys[8]],
                project: row[keys[9]],
            }
        })

        return [feedback, reflection];
    };

    const groupByStudent = (data: FeedbackRow[]): Record<string, FeedbackRow[]> => {
        return data.reduce((acc: Record<string, FeedbackRow[]>, cur: FeedbackRow) => {
            const key = normalizeName(cur.student);
            if (!acc[key]) acc[key] = [];
            acc[key].push(cur);
            return acc;
        }, {});
    };

    const handleMerge = (source: string, target: string) => {
        setRows(prev =>
            prev.map(r => r.student === source ? { ...r, student: target } : r)
        );
    };

    const groupedStudents = groupByStudent(rows);
    const filteredStudents = Object.entries(groupedStudents).filter(([student]) =>
        student.includes(search.toLowerCase())
    );

    const studentNames = Object.keys(groupedStudents);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold mb-4">Team Feedback Viewer</h1>
            <input type="file" accept=".csv" onChange={handleUpload} className="p-2 border rounded" />
            <input
                type="text"
                placeholder="Search by reviewee"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 border rounded ml-4"
            />
            <button
                className="px-4 py-2 bg-green-600 text-white rounded ml-4"
                onClick={() => setMergeOpen(true)}
            >
                Merge Students
            </button>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded ml-2"
                onClick={handleExport}
            >
                Export CSV
            </button>
            <button
                className="px-4 py-2 bg-orange-600 text-white rounded ml-2"
                onClick={() => setMode(!mode)}
            >
                Mode: {mode ? "Feedback" : "Reflection"}
            </button>

            {mode ? 
                filteredStudents.map(([student, feedback], idx) => (
                    <div key={idx} className="bg-white shadow rounded p-6 border mt-6">
                        <h2 className="text-2xl font-semibold mb-4">{student}</h2>
                        <FeedbackTable student={student} feedback={feedback}/>
                    </div>
                )) : Object.entries(reflections).map(([student, reflection], idx) => (
                    <div key={idx} className="bg-white shadow rounded p-6 border mt-6">
                        <h2 className="text-2xl font-semibold mb-4">{student}</h2>
                        <ReflectionTable student={student} reflection={reflection} />
                    </div>
                ))
                
            }

            {mergeOpen && (
                <MergeModal
                    students={studentNames}
                    onMerge={handleMerge}
                    onClose={() => setMergeOpen(false)}
                />
            )}
        </div>
    );
};

export default App;

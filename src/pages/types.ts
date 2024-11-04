import { Timestamp } from "firebase/firestore";

export const enum InputOption {
    todolist = "todolist",
    analysis = "analysis",
    code_analysis = "code_analysis",
    type = "type",
    none = ""
}

export type Problem = {
    id?: string;
    title: string;
    description: string;
    user_solution: string;
    date_solved?: Timestamp;
    difficulty: number;
    status?: string;
    topics: string[];
    time_complexity: string;
    space_complexity: string;
    link: string;
}

export type Topic = {
    name: string;
    count: number;
}
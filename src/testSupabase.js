import dotenv from "dotenv";
import supabase from "./config/supabase.js";

dotenv.config();

const testSupabase = async () => {
    try {
        console.log("Testing Supabase Storage...");

        const { data, error } = await supabase.storage
            .from("helphub-files")
            .list("", {
                limit: 10
            });

        if (error) {
            throw error;
        }

        console.log("Supabase Storage connection successful!");
        console.log("Files in helphub-files:");
        console.log(data);

    } catch (error) {
        console.error("Supabase Storage connection failed:");
        console.error(error.message);
    }
};

testSupabase();
import supabase from "../config/supabase.js";

const BUCKET_NAME = "helphub-files";

export const uploadFile = async (file, folder) => {
    if (!file) {
        throw new Error("No file provided");
    }

    const fileName = `${Date.now()}-${file.originalname}`;

    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        throw error;
    }

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return {
        filePath,
        fileUrl: data.publicUrl
    };
};

export default uploadFile;

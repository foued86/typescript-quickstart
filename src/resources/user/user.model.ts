import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import User from "@/resources/user/user.interface";

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
        }
    },
    { timestamps: true }
);

UserSchema.pre<User>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

UserSchema.methods.isValidPassword = async function (password: string): Promise<Error | boolean> {
    return await bcrypt.compare(password, this.password);
};

UserSchema.path('email').validate((email: string) => {
    const countEmail = mongoose.models.User.countDocuments({ email });

    return !countEmail;
}, "This email is already used!");

export default model<User>('User', UserSchema);
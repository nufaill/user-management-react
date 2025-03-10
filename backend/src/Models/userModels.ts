import mongoose, { Document,Schema } from "mongoose";

export interface IUser extends Document {
    _id: string;
    name: string;
    email:string;
    password : string;
    mobile?: string;
    image?: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: {type: String, required:true},
        email: {type: String, required:true, unique:true},
        password: {type: String, required:true},
        mobile: {type: String,unique:true, sparse:true},
        image: {type: String},
        isAdmin: {type: Boolean, default:false},
    },
    {timestamps: true}
);

export default mongoose.model<IUser>("User", UserSchema);
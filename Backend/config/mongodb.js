import mongoose from "mongoose"

const connectDB = async () => {

    mongoose.connection.on("connected",()=>{
        console.log("database connected")
        console.log("Database name:", mongoose.connection.name);
    })

    await mongoose.connect(`${process.env.MONGO_URI}/ThoughtNest`) //url or our database
}
export default connectDB;
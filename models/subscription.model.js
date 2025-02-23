import mongoose, { mongo } from "mongoose";
import User from "./user.model";

const subscriptionSchema = new mongoose.Schema ({

    name : {
        type: String,
        required: [true, 'Subscription name is required'],
        trim:true,
        minLenght:2,
        maxLenght:100 
    },

    price: {
        type:Number,
        required:[true, 'Subscription price is required'],
        min:[0,'Price must be greater than 0']
    },
    currency:{
        type:String,
        enum: ['INR' ,'USD' , 'EUR'],
        default : 'INR'
    },
    frequency: {
        type: String,
        enum:[  'daily','weekly' , 'monthly' , 'yearly'],
    },
    category: {
        type: String,
        enum: ['sports' , 'entertainment' , 'lifestyle']
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type:String,
        enum: ['active' , 'cancelled' , 'expired'],
        default: 'active',
    },
    startDate: {
        type: Date,
        required: true,
        validate : {
            validator: (value) => value <= new Date(),
            message: 'Start date must  be in the past'
        }
    },
    renewalDate: {
        type: Date,
        validate : {
            validator: function (value) {
                return value >  this.startDate;
            },
            message: 'Renewal Must be after the start date',   
        }
    },
    //user who subscribed , this model refers to the user model using the Object ID
    user :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' ,  //user model
        required: true,
        index: true,    
    }

},{timestamps: true});


//A pre-save hook (pre('save')) is a function that runs before saving a document in MongoDB.
// It modifies data before saving.
// Auto calculating the renewal date
subscriptionSchema.pre('save' , function(next) {
    if(!this.renewalDate){
        const renewalPeriods  = {
            daily:1,
            weekly:7,
            monthly:30,
            yearly:365,
        };

        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
        
    }

        //Auto update the status  if renewal date has passsed
        if(this.renewalDate < new Date()) {
            this.status = 'expired';
        }

        next();
});

const Subscription = mongoose.model('Subscription' , subscriptionSchema);

export default Subscription;


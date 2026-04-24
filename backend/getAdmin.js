const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/trueorigin')
    .then(async () => {
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            admin = await User.create({
                name: 'Admin User',
                email: 'admin@trueorigin.com',
                password: 'adminpassword123',
                role: 'admin'
            });
            console.log('Created new admin:');
            console.log('Email: ' + admin.email);
            console.log('Password: adminpassword123');
        } else {
            console.log('Found existing admin:');
            console.log('Email: ' + admin.email);
            admin.password = 'adminpassword123';
            await admin.save();
            console.log('Password reset to: adminpassword123');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

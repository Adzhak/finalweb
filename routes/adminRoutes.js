// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const Item = require('../models/Item'); // Assuming Item model is defined

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Route to handle file upload

router.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        res.render('admin-panel', { items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        }
        const imagePath = req.file.path;
        res.status(200).send(imagePath);
    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to add a new item
router.post('/add-item', async (req, res) => {
    try {
        const { name_en, name_ru, description_en, description_ru, picture1, picture2, picture3 } = req.body;
        const newItem = new Item({
            name_en,
            name_ru,
            description_en,
            description_ru,
            picture1, 
            picture2, 
            picture3
        });
        await newItem.save();
        res.redirect('/admin-panel');
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).send('Error adding item');
    }
});

// Route to edit an existing item
router.post('/update-item/:id', async (req, res) => {
    const { name_en, name_ru, description_en, description_ru, picture1, picture2, picture3 } = req.body;
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, {
            name_en,
            name_ru,
            description_en,
            description_ru,
            picture1,
            picture2,
            picture3,
            updatedAt: Date.now()
        }, { new: true });
        res.redirect('/admin-panel');
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).send('Error updating item');
    }
});

// Route to delete an existing item
router.post('/delete-item/:id', async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.redirect('/admin-panel');
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send('Error deleting item');
    }
});

module.exports = router;

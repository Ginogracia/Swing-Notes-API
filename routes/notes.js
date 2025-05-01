const express = require('express');
const router = express.Router();

const Note = require('../models/Note')
const User = require('../models/User');

const verifyToken = require('../middleware/verifyToken')

router.use(verifyToken)

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Notes management
 */

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes for the logged-in user
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       401:
 *         description: Authentication failed – invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', async (req, res) => {
    try {
      // Find the user by userId (from token)
      const user = await User.findOne({ userId: req.user.userId }).populate('notes');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Send back only the notes
      res.json(user.notes);
      
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - text
 *             properties:
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication failed – invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', async (req, res) => {
    try {
        const note = new Note({ 
            title: req.body.title, 
            text: req.body.text,
        })

        const newNote = await note.save()
        const user = await User.findOne({ userId: req.user.userId });
        user.notes.push(newNote._id);

        await user.save();
        res.status(201).json({
            message: `The note: ${req.body.title} has been created and saved!`,
            user: user
        })
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

/**
 * @swagger
 * /notes:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - noteId
 *             properties:
 *               noteId:
 *                 type: string
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication failed – invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/', async (req, res) => {
  const { noteId, title, text } = req.body;

  if (!noteId) {
    return res.status(400).json({ message: 'noteId is required in the request body.' });
  }

  if (!title && !text) {
    return res.status(400).json({ message: 'At least one of title or text must be provided.' });
  }

  try {
    // Find user and populate notes
    const user = await User.findOne({ userId: req.user.userId }).populate('notes');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Search for the note within user's notes
    const note = user.notes.find(n => n.noteId === noteId);

    if (!note) {
      return res.status(404).json({ message: 'Note not found or does not belong to you.' });
    }

    // Update fields
    if (title) note.title = title;
    if (text) note.text = text;
    note.modifiedAt = Date.now();

    const updatedNote = await note.save();

    res.status(200).json({
      message: `Note "${updatedNote.title}" has been updated.`,
      note: updatedNote
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/**
 * @swagger
 * /notes:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - noteId
 *             properties:
 *               noteId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageOnly'
 *       404:
 *         description: Note not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication failed – invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/', async (req, res) => {
    const { noteId } = req.body;

    if (!noteId) {
      return res.status(400).json({ message: 'noteId is required in the request body.' });
    }
  
    try {
      const deletedNote = await Note.findOne({ noteId: noteId });
  
      if (!deletedNote) {
        return res.status(404).json({ message: 'Note not found.' });
      }
  
      await User.updateOne(
        { userId: req.user.userId },
        { $pull: { notes: deletedNote._id } }
      );
  
      res.status(200).json({ message: `The note: ${deletedNote.title} has been deleted.` });
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


/**
 * @swagger
 * /notes/search:
 *   get:
 *     summary: Search for a note by title
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: title
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication failed – invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/search', async (req, res) => {
  try {
    // Find the user by userId (from token)
    const user = await User.findOne({ userId: req.user.userId }).populate('notes');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    //Query because body is bad practise for GET requests.
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ message: 'Title is required in the query string.' });
    }

    const foundNote = user.notes.find(note =>
      note.title.toLowerCase() === title.toLowerCase()
    );

    if (!foundNote) {
      return res.status(404).json({ message: 'Note with that title not found.' });
    }

    res.status(200).json(foundNote);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
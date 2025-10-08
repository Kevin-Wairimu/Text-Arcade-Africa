const Article = require('../models/Article'); // Make sure this path is correct

// --- GET ALL ARTICLES ---
exports.getAllArticles = async (req, res) => {
  console.log('SERVER: getAllArticles controller hit with query:', req.query);
  try {
    const { search, category } = req.query;

    // Build the query object dynamically
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      // Use $or to search in both title and content
      // Use $regex with 'i' for case-insensitive search
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // First, find all matching articles to get the total count
    const total = await Article.countDocuments(query);
    
    // Then, find the articles and sort them
    const articles = await Article.find(query).sort({ publishedAt: -1 });

    console.log(`SERVER: Found ${articles.length} articles out of ${total} total matches.`);
    
    // Return both the articles and the total count
    res.json({ articles, total });
    
  } catch (err) {
    console.error('SERVER ERROR fetching articles:', err.message);
    res.status(500).send('Server Error');
  }
};

// --- GET A SINGLE ARTICLE BY ID ---
exports.getArticleById = async (req, res) => {
  console.log(`SERVER: getArticleById controller hit for ID: ${req.params.id}`);
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Article not found' });
    }
    res.status(500).send('Server Error');
  }
};

// --- CREATE A NEW ARTICLE ---
exports.createArticle = async (req, res) => {
  console.log('SERVER: createArticle controller hit.');
  const { title, content, author, category, featured, image } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ message: 'Title, content, and category are required.' });
  }
  try {
    const newArticle = new Article({
      title, content, author, category, featured, image, publishedAt: new Date()
    });
    const article = await newArticle.save();
    console.log('SERVER: New article saved successfully.');
    res.status(201).json(article);
  } catch (err) {
    console.error('SERVER ERROR creating article:', err.message);
    res.status(500).send('Server Error');
  }
};

// --- UPDATE AN ARTICLE ---
// This is the function that was not being exported correctly.
exports.updateArticle = async (req, res) => {
  console.log(`SERVER: updateArticle controller hit for ID: ${req.params.id}`);
  const { title, content, author, category, featured, image } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ message: 'Title, content, and category are required.' });
  }
  try {
    let article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    article.title = title;
    article.content = content;
    article.author = author;
    article.category = category;
    article.featured = featured;
    article.image = image;
    const updatedArticle = await article.save();
    console.log('SERVER: Article updated successfully.');
    res.json(updatedArticle);
  } catch (err) {
    console.error('SERVER ERROR updating article:', err.message);
    res.status(500).send('Server Error');
  }
};

// --- DELETE AN ARTICLE ---
exports.deleteArticle = async (req, res) => {
  console.log(`SERVER: deleteArticle controller hit for ID: ${req.params.id}`);
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    await article.deleteOne();
    console.log(`SERVER: Article with ID ${req.params.id} deleted.`);
    res.json({ message: 'Article removed' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Article not found' });
    }
    res.status(500).send('Server Error');
  }
};
const supabase = require("../config/supabase");
const slugify = require("slugify");

// --- GET article by slug ---
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ message: "Slug is required" });

    // Increment views if not Admin
    if (req.method === 'GET' && (!req.user || req.user.role !== 'Admin')) {
      await supabase.rpc('increment_views_by_slug', { article_slug: slug });
      if (req.io) {
        req.io.emit("viewsUpdated", { slug });
      }
    }

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !article) return res.status(404).json({ message: "Article not found" });

    res.status(200).json({ article });
  } catch (err) {
    console.error("Error fetching article by slug:", err);
    res.status(500).json({ error: "Failed to fetch article", details: err.message });
  }
};

// --- GET all articles with optional filters ---
exports.getAllArticles = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('articles')
      .select('id, title, image, images, category, views, publishedAt, slug, author, content, order, imageLabels', { count: 'exact' });

    if (req.query.category && req.query.category !== "All") {
      query = query.eq('category', req.query.category);
    }

    if (req.query.search) {
      const search = req.query.search.trim();
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: articles, count: total, error } = await query
      .order('order', { ascending: true })
      .order('publishedAt', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const optimizedArticles = articles.map(article => {
      // Create a clean text snippet by stripping HTML tags
      const cleanText = article.content 
        ? article.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
        : "";
        
      return {
        ...article,
        content: cleanText.substring(0, 200)
      };
    });

    res.json({ articles: optimizedArticles, total, page, limit, hasMore: (page * limit) < total });
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ error: "Failed to fetch articles", details: err.message });
  }
};

// --- GET article by ID ---
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const field = isUUID ? 'id' : 'slug';

    // Increment view count if not Admin
    if (req.method === 'GET' && (!req.user || req.user.role !== 'Admin')) {
      if (isUUID) {
        await supabase.rpc('increment_views', { article_id: id });
      } else {
        await supabase.rpc('increment_views_by_slug', { article_slug: id });
      }
      
      if (req.io) {
        req.io.emit("viewsUpdated", { idOrSlug: id });
      }
    }

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq(field, id)
      .single();
    
    if (error || !article) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(article);
  } catch (err) {
    console.error("Error fetching article by ID:", err);
    res.status(500).json({ error: "Failed to fetch article", details: err.message });
  }
};

// --- CREATE article ---
exports.createArticle = async (req, res) => {
  try {
    const images = req.body.images || [];
    const articleData = {
      ...req.body,
      image: images.length > 0 ? images[0] : req.body.image,
      slug: slugify(req.body.title || "article", { lower: true, strict: true }),
      publishedAt: req.body.publishedAt || new Date(),
      views: req.body.views || 0,
      videoUrl: req.body.videoUrl || "",
    };

    const { data: article, error } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(article);
  } catch (err) {
    console.error("Error creating article:", err);
    res.status(500).json({ error: "Failed to create article", details: err.message });
  }
};

// --- UPDATE article ---
exports.updateArticle = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Remove MongoDB/Mongoose specific or read-only fields
    delete updateData._id;
    delete updateData.id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.created_at;
    delete updateData.updated_at;

    if (updateData.title) updateData.slug = slugify(updateData.title, { lower: true, strict: true });
    
    if (updateData.images && updateData.images.length > 0) {
      updateData.image = updateData.images[0];
    }

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(400).json({ error: "Failed to update article", details: error.message });
    }

    if (!article) return res.status(404).json({ error: "Article not found" });

    res.json(article);
  } catch (err) {
    console.error("Error updating article:", err);
    res.status(500).json({ error: "Failed to update article", details: err.message });
  }
};

// --- DELETE article ---
exports.deleteArticle = async (req, res) => {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !article) return res.status(404).json({ error: "Article not found" });

    res.json({ message: "Article deleted successfully" });
  } catch (err) {
    console.error("Error deleting article:", err);
    res.status(500).json({ error: "Failed to delete article", details: err.message });
  }
};

// --- REORDER articles ---
exports.reorderArticles = async (req, res) => {
  try {
    const { orders } = req.body; 
    if (!Array.isArray(orders)) return res.status(400).json({ error: "Orders array required" });

    const promises = orders.map(({ id, order }) => 
      supabase.from('articles').update({ order }).eq('id', id)
    );

    await Promise.all(promises);
    res.json({ message: "Order updated successfully" });
  } catch (err) {
    console.error("Error reordering articles:", err);
    res.status(500).json({ error: "Failed to reorder", details: err.message });
  }
};

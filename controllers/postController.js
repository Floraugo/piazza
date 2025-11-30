const Post = require('../models/Post');

async function refreshPostStatus(post) {
  if (post.status === 'Live' && new Date() > new Date(post.expiresAt)) {
    post.status = 'Expired';
    await post.save();
  }
}

exports.createPost = async (req, res) => {
  try {
    const { title, body, topics, expiresInMinutes } = req.body;
    if (!title || !body || !topics || !expiresInMinutes)
      return res.status(400).json({ msg: 'Missing fields' });

    const expiresAt = new Date(Date.now() + parseInt(expiresInMinutes) * 60000);

    const post = new Post({
      title,
      body,
      topics,
      owner: { userId: req.user.id, name: req.user.name },
      expiresAt
    });

    await post.save();
    res.json(post);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getPostsByTopic = async (req, res) => {
  try {
    const topic = req.params.topic;

    let posts = await Post.find({ topics: topic }).sort({ createdAt: -1 });

    await Promise.all(posts.map(p => refreshPostStatus(p)));

    posts = await Post.find({ topics: topic }).sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.interact = async (req, res) => {
  try {
    const { type, comment } = req.body;
    const { id } = req.params;

    if (!['like','dislike','comment'].includes(type))
      return res.status(400).json({ msg: 'Invalid type' });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    if (new Date() > post.expiresAt) {
      post.status = 'Expired';
      await post.save();
      return res.status(400).json({ msg: 'Cannot interact with expired post' });
    }

    if (post.owner.userId.toString() === req.user.id && (type === 'like' || type === 'dislike')) {
      return res.status(400).json({ msg: 'Owner cannot like/dislike own post' });
    }

    if (type === 'like' || type === 'dislike') {
      const existing = post.interactions.find(i => i.userId.toString() === req.user.id && (i.type === 'like' || i.type === 'dislike'));
      if (existing) {
        existing.type = type;
        existing.createdAt = new Date();
      } else {
        post.interactions.push({ userId: req.user.id, type });
      }
    }

    if (type === 'comment') {
      post.interactions.push({ userId: req.user.id, type, comment });
    }

    await post.save();
    res.json(post);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getMostActivePost = async (req, res) => {
  try {
    const topic = req.params.topic;
    const posts = await Post.find({ topics: topic, status: 'Live' });

    let best = null;
    let bestScore = -1;

    posts.forEach(p => {
      const score = p.interactions.filter(i => i.type === 'like' || i.type === 'dislike').length;
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    });

    res.json({ post: best });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getExpiredPostsByTopic = async (req, res) => {
  try {
    const topic = req.params.topic;
    const posts = await Post.find({ topics: topic, status: 'Expired' });

    res.json(posts);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

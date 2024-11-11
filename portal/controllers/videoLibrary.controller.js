const { video_categories, videos } = require("../models");

module.exports = (function () {
  this.createCategory = async (req, res, next) => {
    try {

      let categoryName = await video_categories.findOne({
        where: { name: req.body.name }
      });
      if (categoryName) throw new Error("Category with same name already exists.");

      res.json({
        success: true,
        data: await video_categories.create(req.body),
      });
    } catch (error) {
      next(error);
    }
  };

  this.createVideo = async (req, res, next) => {
    try {
      let videoName = await videos.findOne({
        where: { title: req.body.title }
      });

      if (videoName && (videoName?.dataValues?.id !== Number(req.params.id))) {
        let video = await video_categories.findOne({
          where: { id: videoName?.dataValues?.categoryId },
        });
        throw new Error(`Video with same name already exists in ${video?.dataValues?.name}.`);
      } 

      let presentvideo = await videos.findOne({
        where: { videoId: req.body.videoId }
      });

      if (presentvideo && (presentvideo?.dataValues?.id !== Number(req.params.id))) {
        let video = await video_categories.findOne({
          where: { id: presentvideo?.dataValues?.categoryId },
        });
        throw new Error(`Video with same videoId already exists in ${video?.dataValues?.name}.`);
      }

      res.json({
        success: true,
        data: await videos.create(req.body),
      });
    } catch (error) {
      next(error);
    }
  };

  this.getAllCategories = async (req, res, next) => {
    try {
      res.json({
        success: true,
        data: await video_categories.findAll(),
      });
    } catch (error) {
      next(error);
    }
  };

  this.getVideosByCategoryId = async (req, res, next) => {
    try {
      res.json({
        success: true,
        data: await video_categories.findOne({
          where: {
            id: req.params.categoryId,
          },
          include: [
            {
              model: videos,
              as: "videos",
            },
          ],
        }),
      });
    } catch (error) {
      next(error);
    }
  };

  this.updateCategory = async (req, res, next) => {
    try {
      const category = await video_categories.findOne({
        where: { id: req.params.id },
      });

      if (!category) throw new Error("Invalid Category Id.");

      let categoryName = await video_categories.findOne({
        where: { name: req.body.name }
      });
      if (categoryName) throw new Error("Category with same name already exists.");

      category.name = req.body.name;
      res.json({
        success: true,
        data: await category.save(),
      });
    } catch (error) {
      next(error);
    }
  };

  this.updateVideo = async (req, res, next) => {
    try {
      const video = await videos.findOne({
        where: { id: req.params.id },
      });

      if (!video) throw new Error("Invalid Video Id.");

      let videoName = await videos.findOne({
        where: { title: req.body.title }
      });
      if (videoName && (videoName?.dataValues?.id !== Number(req.params.id))) {
        let video = await video_categories.findOne({
          where: { id: videoName?.dataValues?.categoryId },
        });
        throw new Error(`Video with same name already exists in ${video?.dataValues?.name}.`);
      } 

      let presentvideo = await videos.findOne({
        where: { videoId: req.body.videoId }
      });

      if (presentvideo && (presentvideo?.dataValues?.id !== Number(req.params.id))) {
        let video = await video_categories.findOne({
          where: { id: presentvideo?.dataValues?.categoryId },
        });
        throw new Error(`Video with same videoId already exists in ${video?.dataValues?.name}.`);
      }

      res.json({
        success: true,
        data: await video.update(req.body),
      });
    } catch (error) {
      next(error);
    }
  };

  this.updateCategoryIdOfVideo = async (req, res, next) => {
    try {
      const video = await videos.findOne({
        where: { id: req.params.videoId },
      });

      if (!video) throw new Error("Invalid Video Id.");
      video.categoryId = req.body.newCategoryId;
      await video.save();
      res.json({
        success: true,
        data: await video_categories.findOne({
          where: {
            id: req.body.oldCategoryId,
          },
          include: [
            {
              model: videos,
              as: "videos",
            },
          ],
        }),
      });
    } catch (error) {
      next(error);
    }
  };

  this.deleteCategory = async (req, res, next) => {
    try {
      const category = await video_categories.findOne({
        where: { id: req.params.id },
      });

      if (!category) throw new Error("Invalid Category Id.");

      res.json({
        success: true,
        data: await category.destroy(),
      });
    } catch (error) {
      next(error);
    }
  };

  this.deleteVideo = async (req, res, next) => {
    try {
      const video = await videos.findOne({
        where: { id: req.params.id },
      });

      if (!video) throw new Error("Invalid Video Id.");

      res.json({
        success: true,
        data: await video.destroy(),
      });
    } catch (error) {
      next(error);
    }
  };

  return this;
})();

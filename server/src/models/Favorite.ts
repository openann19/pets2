/**
 * Favorite Model
 * 
 * Stores user's favorited pets (separate from matches/likes).
 * Used for saving interesting pets for later viewing.
 */

const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        petId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pet',
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index to prevent duplicate favorites
favoriteSchema.index({ userId: 1, petId: 1 }, { unique: true });

// Index for querying user's favorites
favoriteSchema.index({ userId: 1, createdAt: -1 });

// Virtual for favorite age
favoriteSchema.virtual('age').get(function () {
    return Date.now() - this.createdAt.getTime();
});

// Static method: Get user's favorites with populated pet data
favoriteSchema.statics.getUserFavorites = async function (userId, pageOrOptions = {}, perPage) {
    // Support legacy signature: (userId, page, limit)
    let page, limit;
    let sort = { createdAt: -1, _id: -1 };
    let skip;

    if (typeof pageOrOptions === 'number') {
        page = pageOrOptions || 1;
        limit = perPage || 10;
        skip = (page - 1) * limit;
    } else {
        const options = pageOrOptions || {};
        limit = options.limit || 50;
        skip = options.skip || 0;
        sort = options.sort || sort;
        page = Math.floor(skip / limit) + 1;
    }

    const [favorites, totalFavorites] = await Promise.all([
        this.find({ userId })
            .populate({
                path: 'petId',
                select: 'name breed age photos location species gender description',
            })
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .lean(),
        this.countDocuments({ userId })
    ]);

    const totalPages = Math.max(1, Math.ceil(totalFavorites / limit) || 1);
    const currentPage = page;
    const hasNextPage = currentPage < totalPages;

    return {
        favorites,
        totalFavorites,
        totalPages,
        currentPage,
        hasNextPage
    };
};

// Static method: Check if pet is favorited by user
favoriteSchema.statics.isFavorited = async function (userId, petId) {
    const favorite = await this.findOne({ userId, petId });
    return !!favorite;
};

// Static method: Get favorite count for a pet
favoriteSchema.statics.getPetFavoriteCount = async function (petId) {
    return this.countDocuments({ petId });
};

// Static method: Get user's favorite count
favoriteSchema.statics.getUserFavoriteCount = async function (userId) {
    return this.countDocuments({ userId });
};

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;

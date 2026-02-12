const { PrismaClient } = require('@prisma/client');
const { Client } = require('pg');

// Supabase PostgreSQL connection
const SUPABASE_DB_URL = process.env.SUPABASE_DATABASE_URL || 'postgresql://postgres.lszccbdufyaohdihzult:gyP8HpDNfSTGnbvW@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1';

// Railway PostgreSQL connection for target
const RAILWAY_DB_URL = 'postgresql://postgres:pAmlAcBzvvAGvHttZWLdtjGEfypwajSG@shinkansen.proxy.rlwy.net:47369/railway';

// Create Prisma client with explicit Railway URL
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: RAILWAY_DB_URL
        }
    }
});

const supabaseClient = new Client({
    connectionString: SUPABASE_DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrateData() {
    console.log('🚀 Starting migration from Supabase to PostgreSQL...');

    try {
        // Connect to Supabase
        await supabaseClient.connect();
        console.log('✅ Connected to Supabase database');

        // Step 1: Migrate Languages
        console.log('📝 Migrating languages...');
        try {
            const languagesResult = await supabaseClient.query('SELECT * FROM languages ORDER BY "createdAt"');
            const languages = languagesResult.rows;

            for (const lang of languages) {
                await prisma.language.upsert({
                    where: { code: lang.code },
                    update: {
                        name: lang.name,
                        nativeName: lang.nativeName || lang.name,
                        isRTL: lang.isRTL || false,
                        isActive: lang.isActive !== false,
                    },
                    create: {
                        id: lang.id,
                        code: lang.code,
                        name: lang.name,
                        nativeName: lang.nativeName || lang.name,
                        isRTL: lang.isRTL || false,
                        isActive: lang.isActive !== false,
                        createdAt: new Date(lang.createdAt || Date.now()),
                        updatedAt: new Date(lang.updatedAt || Date.now()),
                    }
                });
            }
            console.log(`✅ Migrated ${languages.length} languages`);
        } catch (error) {
            console.warn('⚠️ Languages table not found or error:', error.message);
        }

        // Step 2: Migrate Users
        console.log('👥 Migrating users...');
        try {
            const usersResult = await supabaseClient.query('SELECT * FROM users ORDER BY "createdAt"');
            const users = usersResult.rows;

            for (const user of users) {
                await prisma.user.upsert({
                    where: { email: user.email },
                    update: {
                        name: user.name,
                        role: user.role || 'EDITOR',
                    },
                    create: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role || 'EDITOR',
                        createdAt: new Date(user.createdAt || Date.now()),
                        updatedAt: new Date(user.updatedAt || Date.now()),
                    }
                });
            }
            console.log(`✅ Migrated ${users.length} users`);
        } catch (error) {
            console.warn('⚠️ Users table not found or error:', error.message);
        }

        // Step 3: Migrate Tags
        console.log('🏷️ Migrating tags...');
        try {
            const tagsResult = await supabaseClient.query('SELECT * FROM tags ORDER BY "createdAt"');
            const tags = tagsResult.rows;

            for (const tag of tags) {
                await prisma.tag.upsert({
                    where: { slug: tag.slug },
                    update: {
                        name: tag.name,
                        color: tag.color,
                    },
                    create: {
                        id: tag.id,
                        name: tag.name,
                        slug: tag.slug,
                        color: tag.color,
                        createdAt: new Date(tag.createdAt || Date.now()),
                        updatedAt: new Date(tag.updatedAt || Date.now()),
                    }
                });
            }
            console.log(`✅ Migrated ${tags.length} tags`);
        } catch (error) {
            console.warn('⚠️ Tags table not found or error:', error.message);
        }

        // Step 4: Migrate Tag Translations
        console.log('🌐 Migrating tag translations...');
        try {
            const tagTransResult = await supabaseClient.query('SELECT * FROM tag_translations ORDER BY "createdAt"');
            const tagTranslations = tagTransResult.rows;

            for (const tagTrans of tagTranslations) {
                try {
                    await prisma.tagTranslation.upsert({
                        where: {
                            tagId_languageCode: {
                                tagId: tagTrans.tagId,
                                languageCode: tagTrans.languageCode
                            }
                        },
                        update: {
                            name: tagTrans.name,
                        },
                        create: {
                            id: tagTrans.id,
                            name: tagTrans.name,
                            tagId: tagTrans.tagId,
                            languageCode: tagTrans.languageCode,
                            createdAt: new Date(tagTrans.createdAt || Date.now()),
                            updatedAt: new Date(tagTrans.updatedAt || Date.now()),
                        }
                    });
                } catch (error) {
                    console.warn(`Skipping tag translation ${tagTrans.id}:`, error.message);
                }
            }
            console.log(`✅ Migrated ${tagTranslations.length} tag translations`);
        } catch (error) {
            console.warn('⚠️ Tag translations table not found or error:', error.message);
        }

        // Step 5: Migrate Articles
        console.log('📰 Migrating articles...');
        try {
            const articlesResult = await supabaseClient.query('SELECT * FROM articles ORDER BY "createdAt"');
            const articles = articlesResult.rows;

            for (const article of articles) {
                try {
                    await prisma.article.upsert({
                        where: {
                            slug_originalLanguageId: {
                                slug: article.slug,
                                originalLanguageId: article.originalLanguageId
                            }
                        },
                        update: {
                            title: article.title,
                            excerpt: article.excerpt,
                            content: article.content,
                            coverUrl: article.coverUrl,
                            status: article.status || 'DRAFT',
                            publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
                            scheduledAt: article.scheduledAt ? new Date(article.scheduledAt) : null,
                            estimatedReadingMinutes: article.estimatedReadingMinutes || 5,
                            metaTitle: article.metaTitle,
                            metaDescription: article.metaDescription,
                            keywords: article.keywords,
                        },
                        create: {
                            id: article.id,
                            title: article.title,
                            slug: article.slug,
                            excerpt: article.excerpt,
                            content: article.content,
                            coverUrl: article.coverUrl,
                            status: article.status || 'DRAFT',
                            publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
                            scheduledAt: article.scheduledAt ? new Date(article.scheduledAt) : null,
                            estimatedReadingMinutes: article.estimatedReadingMinutes || 5,
                            metaTitle: article.metaTitle,
                            metaDescription: article.metaDescription,
                            keywords: article.keywords,
                            authorId: article.authorId,
                            originalLanguageId: article.originalLanguageId,
                            createdAt: new Date(article.createdAt || Date.now()),
                            updatedAt: new Date(article.updatedAt || Date.now()),
                        }
                    });
                } catch (error) {
                    console.warn(`Skipping article ${article.id}:`, error.message);
                }
            }
            console.log(`✅ Migrated ${articles.length} articles`);
        } catch (error) {
            console.warn('⚠️ Articles table not found or error:', error.message);
        }

        // Step 6: Migrate Article Tags
        console.log('🔗 Migrating article tags...');
        try {
            const articleTagsResult = await supabaseClient.query('SELECT * FROM article_tags ORDER BY "createdAt"');
            const articleTags = articleTagsResult.rows;

            for (const articleTag of articleTags) {
                try {
                    await prisma.articleTag.upsert({
                        where: {
                            articleId_tagId: {
                                articleId: articleTag.articleId,
                                tagId: articleTag.tagId
                            }
                        },
                        update: {},
                        create: {
                            id: articleTag.id,
                            articleId: articleTag.articleId,
                            tagId: articleTag.tagId,
                            createdAt: new Date(articleTag.createdAt || Date.now()),
                        }
                    });
                } catch (error) {
                    console.warn(`Skipping article tag ${articleTag.id}:`, error.message);
                }
            }
            console.log(`✅ Migrated ${articleTags.length} article tags`);
        } catch (error) {
            console.warn('⚠️ Article tags table not found or error:', error.message);
        }

        // Step 7: Migrate Article Translations
        console.log('🌍 Migrating article translations...');
        try {
            const articleTransResult = await supabaseClient.query('SELECT * FROM article_translations ORDER BY "createdAt"');
            const articleTranslations = articleTransResult.rows;

            for (const articleTrans of articleTranslations) {
                try {
                    await prisma.articleTranslation.upsert({
                        where: {
                            articleId_languageId: {
                                articleId: articleTrans.articleId,
                                languageId: articleTrans.languageId
                            }
                        },
                        update: {
                            title: articleTrans.title,
                            slug: articleTrans.slug,
                            excerpt: articleTrans.excerpt,
                            content: articleTrans.content,
                            status: articleTrans.status || 'DRAFT',
                            publishedAt: articleTrans.publishedAt ? new Date(articleTrans.publishedAt) : null,
                            scheduledAt: articleTrans.scheduledAt ? new Date(articleTrans.scheduledAt) : null,
                            metaTitle: articleTrans.metaTitle,
                            metaDescription: articleTrans.metaDescription,
                            keywords: articleTrans.keywords,
                        },
                        create: {
                            id: articleTrans.id,
                            title: articleTrans.title,
                            slug: articleTrans.slug,
                            excerpt: articleTrans.excerpt,
                            content: articleTrans.content,
                            status: articleTrans.status || 'DRAFT',
                            publishedAt: articleTrans.publishedAt ? new Date(articleTrans.publishedAt) : null,
                            scheduledAt: articleTrans.scheduledAt ? new Date(articleTrans.scheduledAt) : null,
                            metaTitle: articleTrans.metaTitle,
                            metaDescription: articleTrans.metaDescription,
                            keywords: articleTrans.keywords,
                            articleId: articleTrans.articleId,
                            languageId: articleTrans.languageId,
                            translatorId: articleTrans.translatorId,
                            createdAt: new Date(articleTrans.createdAt || Date.now()),
                            updatedAt: new Date(articleTrans.updatedAt || Date.now()),
                        }
                    });
                } catch (error) {
                    console.warn(`Skipping article translation ${articleTrans.id}:`, error.message);
                }
            }
            console.log(`✅ Migrated ${articleTranslations.length} article translations`);
        } catch (error) {
            console.warn('⚠️ Article translations table not found or error:', error.message);
        }

        // Step 8: Migrate Media Assets (if they exist)
        console.log('🖼️ Migrating media assets...');
        try {
            const mediaResult = await supabaseClient.query('SELECT * FROM media_assets ORDER BY "createdAt"');
            const mediaAssets = mediaResult.rows;

            for (const media of mediaAssets) {
                try {
                    await prisma.mediaAsset.upsert({
                        where: { id: media.id },
                        update: {
                            url: media.url,
                            type: media.type || 'IMAGE',
                            width: media.width,
                            height: media.height,
                            blurhash: media.blurhash,
                            altText: media.altText,
                            seoTitle: media.seoTitle,
                        },
                        create: {
                            id: media.id,
                            url: media.url,
                            type: media.type || 'IMAGE',
                            width: media.width,
                            height: media.height,
                            blurhash: media.blurhash,
                            altText: media.altText,
                            seoTitle: media.seoTitle,
                            createdById: media.createdById,
                            createdAt: new Date(media.createdAt || Date.now()),
                            updatedAt: new Date(media.updatedAt || Date.now()),
                        }
                    });
                } catch (error) {
                    console.warn(`Skipping media asset ${media.id}:`, error.message);
                }
            }
            console.log(`✅ Migrated ${mediaAssets.length} media assets`);
        } catch (error) {
            console.warn('⚠️ Media assets table not found or error:', error.message);
        }

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await supabaseClient.end();
        await prisma.$disconnect();
    }
}

// Run the migration
if (require.main === module) {
    migrateData()
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateData };
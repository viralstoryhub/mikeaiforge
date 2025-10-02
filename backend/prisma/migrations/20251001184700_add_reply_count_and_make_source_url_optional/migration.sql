-- AlterTable
ALTER TABLE "ForumThread" ADD COLUMN     "replyCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "NewsArticle" ALTER COLUMN "sourceUrl" DROP NOT NULL;

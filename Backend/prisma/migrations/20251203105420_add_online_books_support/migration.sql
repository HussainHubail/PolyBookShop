-- AlterTable
ALTER TABLE "books" ADD COLUMN     "book_type" VARCHAR(20) NOT NULL DEFAULT 'physical',
ADD COLUMN     "download_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pdf_file_name" VARCHAR(255),
ADD COLUMN     "pdf_file_size" BIGINT;

-- CreateIndex
CREATE INDEX "books_book_type_idx" ON "books"("book_type");

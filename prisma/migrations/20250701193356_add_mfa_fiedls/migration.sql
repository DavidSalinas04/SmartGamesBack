-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mfaEnable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfaMethod" TEXT;

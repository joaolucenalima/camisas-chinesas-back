-- CreateTable
CREATE TABLE "public"."Person" (
    "id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Shirt" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "imageURL" TEXT,
    "priceInCents" INTEGER,
    "size" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "personId" TEXT NOT NULL,

    CONSTRAINT "Shirt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Shirt" ADD CONSTRAINT "Shirt_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

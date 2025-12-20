-- AddForeignKey
ALTER TABLE "EmailReply" ADD CONSTRAINT "EmailReply_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

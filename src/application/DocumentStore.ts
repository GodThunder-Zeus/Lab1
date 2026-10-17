import { Document } from '../domain/Document.ts';
export interface DocumentStore {
  read(path:string): {document:Document;warnings:string[]};
  write(path:string,document:Document):void;
}

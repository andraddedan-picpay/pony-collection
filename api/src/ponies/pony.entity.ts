import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('ponies')
export class Pony {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  element: string;

  @Column()
  personality: string;

  @Column()
  talent: string;

  @Column({ type: 'text' })
  summary: string;

  @Column()
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}

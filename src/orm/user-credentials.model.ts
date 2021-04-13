import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("USER_CONFIGURATION")
export class UserConfiguration {
    @PrimaryGeneratedColumn({ name: "EMAIL" })
    email!: string;

    @Column({ name: "PASSWORD" })
    name?: string;
}
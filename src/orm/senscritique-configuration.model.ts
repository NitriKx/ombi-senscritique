import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("SENSCRITIQUE_CONFIGURATION")
export class SenscritiqueConfiguration {
    @PrimaryGeneratedColumn({ name: "USER_EMAIL" })
    userEmail!: string;

    @Column({ name: "USER_PASSWORD" })
    userPassword?: string;
}
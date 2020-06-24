import { CreateDateColumn, UpdateDateColumn, BeforeInsert, PrimaryGeneratedColumn } from 'typeorm';
import { IsDate, validate, ValidateIf } from 'class-validator';

export class ModelEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  @ValidateIf((e: ModelEntity) => e.createdAt !== undefined)
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ValidateIf((e: ModelEntity) => e.updatedAt !== undefined)
  @IsDate()
  updatedAt: Date;

  @UpdateDateColumn({ name: 'deleted_at', default: null })
  @IsDate()
  deleteddAt: Date;

  public static async validate(entity: ModelEntity): Promise<any> {
    return await validate(entity, {
      validationError: {
        target: false,
      },
      forbidUnknownValues: true,
    });
  }

  @BeforeInsert()
  public setDate(): void {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

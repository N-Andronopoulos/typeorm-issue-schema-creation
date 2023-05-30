import { NestFactory } from "@nestjs/core";
import { Controller, Module, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Repository } from "typeorm";

@Entity("orders")
export class OrderEntity {
  constructor(foo: number) {
    this.foo = String(foo);
  }

  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column()
  public foo: string;

  @CreateDateColumn()
  public created: Date;

  @OneToMany(() => ItemEntity, items => items.order, { cascade: true })
  public items: ItemEntity[];
}

@Entity("items")
export class ItemEntity {
  constructor(bar: number) {
    this.bar = String(bar);
  }

  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column()
  public bar: string;

  @CreateDateColumn()
  public created: Date;

  @ManyToOne(() => OrderEntity, order => order.items)
  public order: OrderEntity;
}

@Controller()
export class AppController implements OnApplicationBootstrap {
  constructor(@InjectRepository(OrderEntity) private orderRepo: Repository<OrderEntity>) {}

  onApplicationBootstrap(): void {
    const newOrders = [...Array(25)]
      .map((_, idx) => {
        const obj = new OrderEntity(idx);
        obj.items = [...Array(15)].map((_, idx2) => new ItemEntity(idx2));
        return obj;
      });

    // Fill with data
    // And I should get 5 result with 25 total items...
    // ...but I get only 1 ??!
    this.orderRepo
      .save(newOrders)
      .then(res => {
        console.log("Inserted", res);
        this.orderRepo.findAndCount({
          relations: {
            items: true
          },
          order: {
            created: "DESC",
            // This is the issue:
            // When I add the ordering of relation it behaves
            // weirdly and I think It should not....
            items: {
              created: "DESC"
            }
          },
          skip: 0,
          take: 5,
        }).then(console.log); // I should get 5 results not 1 :/ !
      });
  }
}

@Module({
  controllers: [AppController],
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3307,
      username: "root",
      password: "testIssue",
      database: "testDb",
      synchronize: true,
      dropSchema: true,
      logging: true,
      autoLoadEntities: true
    }),
    TypeOrmModule.forFeature([OrderEntity, ItemEntity])
  ]
})
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();

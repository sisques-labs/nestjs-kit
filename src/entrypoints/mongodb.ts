// ─── MongoDB ─────────────────────────────────────────────────────────────────
// Separate entry point so importing '@sisques-labs/nestjs-kit' does not
// require the optional `mongodb` peer dependency. Import from
// '@sisques-labs/nestjs-kit/mongodb' when you use MongoDB repositories.

export * from '../shared/infrastructure/database/mongodb/base-mongo/base-mongo-database.repository';
export * from '../shared/infrastructure/database/mongodb/dtos/base-mongo.dto';
export * from '../shared/infrastructure/database/mongodb/mappers/base-mongodb.mapper';
export * from '../shared/infrastructure/database/mongodb/mongodb.module';
export * from '../shared/infrastructure/database/mongodb/services/mongo.service';

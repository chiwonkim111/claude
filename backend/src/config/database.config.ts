/**
 * TypeORM 데이터베이스 연결 설정
 * - PostgreSQL 연결 정보 및 엔티티 자동 로드 설정
 */
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_DATABASE ?? 'remember_profile_diary',

  // 엔티티 파일 자동 검색 (dist 디렉토리 기준)
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  // 마이그레이션 파일 경로
  migrations: [__dirname + '/../infrastructure/database/typeorm/migrations/*{.ts,.js}'],

  // 개발 환경에서만 스키마 자동 동기화 허용
  synchronize: process.env.NODE_ENV === 'development',

  // 프로덕션 환경에서 쿼리 로깅 비활성화
  logging: process.env.NODE_ENV === 'development',
}

/**
 * Shape of the Kafka connection config the `KafkajsEventPublisherAdapter`
 * expects at the `'kafka'` `ConfigService` namespace. The app registers this
 * itself (reading `KAFKA_*` env vars — the app-specific default client
 * id/topic prefix belongs there, not in this package), typed against this
 * interface so the shape never drifts.
 */
export type KafkaSaslMechanism = 'plain' | 'scram-sha-256' | 'scram-sha-512';

export interface IKafkaSaslConfig {
  mechanism: KafkaSaslMechanism;
  username: string;
  password: string;
}

export interface IKafkaConfig {
  /** Forwarding is opt-in — the adapter is a no-op and never connects when `false`. */
  enabled: boolean;
  clientId: string;
  brokers: string[];
  /** Topic prefix — topics are `${topicPrefix}.${module}` (e.g. `my-service.plants`). */
  topicPrefix: string;
  ssl: boolean;
  sasl: IKafkaSaslConfig | null;
}

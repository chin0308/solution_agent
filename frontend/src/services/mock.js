const mockArchitectureResponse = {
  architecture_style: "Event-Driven Microservices",

  reasoning:
    "High scalability requirements and asynchronous workflows make event-driven microservices the most suitable architecture.",

  services: [
    "Claims Service",
    "Fraud Detection Service",
    "Notification Service",
    "Document Service",
    "Authentication Service",
  ],

  infrastructure: [
    "Kafka",
    "PostgreSQL",
    "Redis",
    "AWS S3",
    "Docker",
  ],

  security: [
    "JWT Authentication",
    "RBAC",
    "Encrypted Storage",
  ],

  scalability: [
    "Horizontal Scaling",
    "Async Processing",
    "Event Streaming",
  ],
};

export default mockArchitectureResponse;
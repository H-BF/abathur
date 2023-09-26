export enum PodStatus {
    PENDING = "Pending",
    RUNNING = "Running",
    SUCCEEDED = "Succeeded",
    FAILED = "Failed",
    UNKNOWN = "Unknown",
    TERMINATING = "Terminating",
    CONTAINER_CREATING = "ContainerCreating"
}

export enum PodConditionTypes {
  POD_SCHEDULED = "PodScheduled",       //под запланирован для узла.
  CONTAINERS_READY = "ContainersReady", //все контейнеры в Pod готовы.
  INITIALIZED = "Initialized",          //все контейнеры инициализации завершились успешно.
  READY = "Ready"                       //модуль может обслуживать запросы, и его следует добавить в пулы балансировки нагрузки всех соответствующих служб.
}
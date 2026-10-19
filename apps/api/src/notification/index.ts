import { notificationRepoLayer } from "#/notification/infrastructure/notification-repository.ts";
import { notificationRouterBuild } from "#/notification/presentation/notification-router.ts";

export const notificationModule: {
	layer: typeof notificationRepoLayer;
	routerBuild: typeof notificationRouterBuild;
} = {
	layer: notificationRepoLayer,
	routerBuild: notificationRouterBuild,
};

export {
	NotificationRepo,
	type TNotificationRepoId,
	type TNotificationRepo,
	type TNotificationRow,
} from "#/notification/domain/notification.ts";
export { notificationCreate } from "#/notification/application/notification-create.ts";

import { ROLE_MESSAGE, AUTH_MESSAGE } from "@app/messages";
import { isRole, PERMISSION, ROLE } from "@app/permissions";
import type { TRoleDto, TRoleUpdateInput } from "@app/schemas";
import { Effect } from "effect";
import { toRoleDto } from "#/role/application/to-role-dto.ts";
import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import {
	EBadRequest,
	type EDatabase,
	EForbidden,
	ENotFound,
} from "#/shared/errors.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import {
	CustomRoleRepo,
	type TCustomRoleRepoId,
} from "#/role/domain/custom-role.ts";

export const roleUpdate = Effect.fn("roleUpdate")(function* (
	input: TRoleUpdateInput,
	actorId: string,
	actorRole: string,
): Effect.fn.Return<
	TRoleDto,
	ENotFound | EBadRequest | EForbidden | EDatabase,
	TCustomRoleRepoId | TActivityRecorderId
> {
	const customRoleRepo = yield* CustomRoleRepo;
	const activityRepo = yield* ActivityRecorder;

	if (
		input.permissions?.includes(PERMISSION.FEATURE_FLAG_MANAGE) === true &&
		actorRole !== ROLE.SUPERADMIN
	) {
		return yield* new EForbidden({ message: AUTH_MESSAGE.FORBIDDEN });
	}

	if (isRole(input.key)) {
		return yield* new EBadRequest({ message: ROLE_MESSAGE.FIXED });
	}

	const updated = yield* customRoleRepo.update(input);

	if (updated === null) {
		return yield* new ENotFound({ message: ROLE_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.ROLE_UPDATE,
		resourceType: ACTIVITY_RESOURCE_TYPE.ROLE,
		resourceId: updated.key,
	});

	const counts = yield* customRoleRepo.memberCounts();
	return toRoleDto(updated, counts);
});

import "@typespec/http";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

namespace CallCalendar;

model EventType {
  id: string;
  title: string;
  description: string;
  @minValue(1)
  @maxValue(540)
  durationMinutes: int32;
}

@get
@route("/api/event-types")
@operationId("listEventTypes")
op listEventTypes(): EventType[];

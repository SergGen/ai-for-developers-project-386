import "@typespec/http";
import "@typespec/openapi3";
import "./event-types.tsp";

using TypeSpec.Http;

@service(#{ title: "Календарь звонков" })
@server("/", "Текущий адрес приложения")
namespace CallCalendar;

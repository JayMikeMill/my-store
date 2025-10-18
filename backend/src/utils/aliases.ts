import "module-alias/register";
import moduleAlias from "module-alias";

const ROOT_DIR = __dirname + "/..";

moduleAlias.addAlias("@root", ROOT_DIR);
moduleAlias.addAlias("@config", ROOT_DIR + "/config");
moduleAlias.addAlias("@adapters", ROOT_DIR + "/adapters");
moduleAlias.addAlias("@controllers", ROOT_DIR + "/controllers");
moduleAlias.addAlias("@middleware", ROOT_DIR + "/middleware");
moduleAlias.addAlias("@services", ROOT_DIR + "/services");
moduleAlias.addAlias("@utils", ROOT_DIR + "/utils");
moduleAlias.addAlias("shared", ROOT_DIR + "/../../shared/dist");

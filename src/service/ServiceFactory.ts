import PeopleRelationService from "./PeopleRelationService.ts";
import ImageClient from "../client/ImageClient.ts";
import PeopleClient from "../client/PeopleClient.ts";
import RelationClient from "../client/RelationClient.ts";
import WorkspaceClient from "../client/WorkspaceClient.ts";
import AuthenticateClient from "../client/AuthenticateClient.ts";

/**
 * Service factory to provide singleton instances of services and clients
 */
class ServiceFactory {
    private static peopleRelationService: PeopleRelationService;
    private static imageClient: ImageClient;
    private static peopleClient: PeopleClient;
    private static relationClient: RelationClient;
    private static workspaceClient: WorkspaceClient;
    private static authenticateClient: AuthenticateClient;

    static getPeopleRelationService(): PeopleRelationService {
        if (!this.peopleRelationService) {
            this.peopleRelationService = new PeopleRelationService();
        }
        return this.peopleRelationService;
    }

    static getImageClient(): ImageClient {
        if (!this.imageClient) {
            this.imageClient = new ImageClient();
        }
        return this.imageClient;
    }

    static getPeopleClient(): PeopleClient {
        if (!this.peopleClient) {
            this.peopleClient = new PeopleClient();
        }
        return this.peopleClient;
    }

    static getRelationClient(): RelationClient {
        if (!this.relationClient) {
            this.relationClient = new RelationClient();
        }
        return this.relationClient;
    }

    static getWorkspaceClient(): WorkspaceClient {
        if (!this.workspaceClient) {
            this.workspaceClient = new WorkspaceClient();
        }
        return this.workspaceClient;
    }

    static getAuthenticateClient(): AuthenticateClient {
        if (!this.authenticateClient) {
            this.authenticateClient = new AuthenticateClient();
        }
        return this.authenticateClient;
    }
}

export default ServiceFactory;

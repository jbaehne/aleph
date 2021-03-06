from pprint import pprint
import graphene
from graphene import relay


class Entity(graphene.ObjectType):

    class Meta:
        interfaces = (relay.Node, )

    name = graphene.String(description='The name of the faction.')

    @classmethod
    def get_node(cls, info, id):
        return {
            'name': 'foo-%s' % id
        }


class Query(graphene.ObjectType):
    entities = graphene.Field(Entity)
    node = relay.Node.Field()

    def resolve_entities(self, info):
        return None


schema = graphene.Schema(query=Query)

query = '''
    query bar {
        node(id: "banana") {
            name
        }
    }
'''

result = schema.execute(query)
pprint(result.errors)
pprint(result.data)

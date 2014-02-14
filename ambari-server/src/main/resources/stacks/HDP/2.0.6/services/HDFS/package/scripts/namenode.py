"""
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

"""

from resource_management import *
from hdfs_namenode import namenode


class NameNode(Script):
  def install(self, env):
    import params

    self.install_packages(env)
    env.set_params(params)
    #TODO remove when config action will be implemented
    self.config(env)

  def start(self, env):
    import params

    env.set_params(params)
    self.config(env)
    namenode(action="start")

  def stop(self, env):
    import params

    env.set_params(params)
    namenode(action="stop")

  def config(self, env):
    import params

    env.set_params(params)
    namenode(action="configure")
    pass

  def status(self, env):
    import status_params

    env.set_params(status_params)
    check_process_status(status_params.namenode_pid_file)
    pass

  def decommission(self, env):
    import params

    env.set_params(params)
    namenode(action="decommission")
    pass

if __name__ == "__main__":
  NameNode().execute()
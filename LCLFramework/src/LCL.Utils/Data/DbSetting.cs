﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;
using System.Data.SqlClient;
using System.Data.Common;
using System.Text.RegularExpressions;

namespace LCL.Data
{
    /// <summary>
    /// 数据库配置
    /// </summary>
    public class DbSetting : DbConnectionSchema
    {
        private DbSetting() { }

        /// <summary>
        /// 配置名称
        /// </summary>
        public string Name { get; private set; }

        /// <summary>
        /// 查找或者根据约定创建连接字符串
        /// </summary>
        /// <param name="dbSetting"></param>
        /// <returns></returns>
        public static DbSetting FindOrCreate(string dbSetting)
        {
            if (dbSetting == null) throw new ArgumentNullException("dbSetting");//可以是空字符串。

            DbSetting setting = null;

            if (!_generatedSettings.TryGetValue(dbSetting, out setting))
            {
                lock (_generatedSettings)
                {
                    if (!_generatedSettings.TryGetValue(dbSetting, out setting))
                    {
                        var config = ConfigurationManager.ConnectionStrings[dbSetting];
                        if (config != null)
                        {
                            setting = new DbSetting
                            {
                                ConnectionString = config.ConnectionString,
                                ProviderName = config.ProviderName,
                            };
                        }
                        else
                        {
                            setting = Create(dbSetting);
                        }

                        setting.Name = dbSetting;

                        _generatedSettings.Add(dbSetting, setting);
                    }
                }
            }

            return setting;
        }

        /// <summary>
        /// 添加一个数据库连接配置。
        /// </summary>
        /// <param name="name"></param>
        /// <param name="connectionString"></param>
        /// <param name="providerName"></param>
        public static DbSetting SetSetting(string name, string connectionString, string providerName)
        {
            if (string.IsNullOrEmpty(name)) throw new InvalidOperationException("string.IsNullOrEmpty(dbSetting.Name) must be false.");
            if (string.IsNullOrEmpty(connectionString)) throw new ArgumentNullException("connectionString");
            if (string.IsNullOrEmpty(providerName)) throw new ArgumentNullException("providerName");

            var setting = new DbSetting
            {
                Name = name,
                ConnectionString = connectionString,
                ProviderName = providerName
            };

            lock (_generatedSettings)
            {
                _generatedSettings[name] = setting;
            }

            return setting;
        }

        /// <summary>
        /// 获取当前已经被生成的 DbSetting。
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<DbSetting> GetGeneratedSettings()
        {
            return _generatedSettings.Values;
        }

        private static Dictionary<string, DbSetting> _generatedSettings = new Dictionary<string, DbSetting>();

        private static DbSetting Create(string dbSetting)
        {
            //查找连接字符串时，根据用户的 LocalSqlServer 来查找。
            var local = ConfigurationManager.ConnectionStrings[DbName_LocalServer];
            if (local != null && local.ProviderName == Provider_SqlClient)
            {
                var builder = new SqlConnectionStringBuilder(local.ConnectionString);

                var newCon = new SqlConnectionStringBuilder();
                newCon.DataSource = builder.DataSource;
                newCon.InitialCatalog = dbSetting;
                newCon.IntegratedSecurity = builder.IntegratedSecurity;
                if (!newCon.IntegratedSecurity)
                {
                    newCon.UserID = builder.UserID;
                    newCon.Password = builder.Password;
                }

                return new DbSetting
                {
                    ConnectionString = newCon.ToString(),
                    ProviderName = local.ProviderName
                };
            }

            return new DbSetting
            {
                ConnectionString = string.Format(@"Data Source={0}.sdf", dbSetting),
                ProviderName = Provider_SqlCe
            };

            //return new DbSetting
            //{
            //    ConnectionString = string.Format(@"Data Source=.\SQLExpress;Initial Catalog={0};Integrated Security=True", dbSetting),
            //    ProviderName = "System.Data.SqlClient"
            //};
        }
    }
}